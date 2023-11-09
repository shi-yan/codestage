use clap::Parser;
use rust_embed::EmbeddedFile;
use rust_embed::RustEmbed;
use serde_json::Map;
use std::fs;
use std::fs::File;
use std::io::ErrorKind;
use std::path::Path;
use std::path::PathBuf;
extern crate fs_extra;
use anyhow::Result;
use fs_extra::dir::CopyOptions;
use fs_extra::TransitProcess;
use serde_json::Value;
use std::process::{ExitCode, Termination};
pub enum CodeStageExitCode {
    OK,
    ERR(String),
}

impl Termination for CodeStageExitCode {
    fn report(self) -> ExitCode {
        match self {
            CodeStageExitCode::OK => ExitCode::SUCCESS,
            CodeStageExitCode::ERR(v) => {
                println!("Error: {}", v);
                ExitCode::from(255)
            }
        }
    }
}

#[derive(RustEmbed)]
#[folder = "dist/"]
struct Asset;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Output folder
    #[arg(short, long, default_value_t = String::from("dist"))]
    target: String,

    /// Manifest file
    #[arg(short, long, default_value_t = String::from("codestage.json"))]
    manifest: String,

    #[arg(short, long)]
    prefix: Option<String>,
}

fn verify_chapter(content: &Map<String, serde_json::Value>, indent: usize, target: &str) -> bool {
    if !content.contains_key("title") {
        println!("Config File Error: A Chapter must have a title.");
        return false;
    } else {
        println!(
            "{:indent$}{}",
            "",
            content.get("title").unwrap(),
            indent = indent
        );
    }

    if content.contains_key("folder") {
        if let Some(folder) = content.get("folder") {
            if let Some(folder_str) = folder.as_str() {
                let mut options = CopyOptions::new();
                options.overwrite = true;
                let handle = |_process_info: TransitProcess| {
                    //println!("{}", process_info.total_bytes);
                    fs_extra::dir::TransitProcessResult::ContinueOrAbort
                };
                match fs_extra::copy_items_with_progress(&[folder_str], &target, &options, handle) {
                    Ok(_r) => {}
                    Err(e) => {
                        println!(
                            "Warning: Can't copy folder {} to {}. {}",
                            &folder_str, &target, &e
                        );
                    }
                }
            } else {
                println!("Config File Error: A folder must be a string.");
                return false;
            }
        }
    }

    if content.contains_key("files") {
        let mut has_seen_index = false;
        if let Some(files) = content.get("files") {
            if let Some(files) = files.as_array() {
                for f in files {
                    if let Some(file) = f.as_object() {
                        if !file.contains_key("filename") {
                            println!("Config File Error: A file must contain a filename.");
                            return false;
                        } else {
                            if let Some(filename) = file.get("filename") {
                                if let Some(filename) = filename.as_str() {
                                    if filename == "index.html" {
                                        has_seen_index = true;
                                    }
                                } else {
                                    println!("Config File Error: Filename should be a string.");
                                    return false;
                                }
                            } else {
                                println!("Config File Error: Filename must be a string.");
                                return false;
                            }
                        }
                    } else {
                        println!("Config File Error: A File entry should be an object.");
                        return false;
                    }
                }
            }
        }

        if has_seen_index == false {
            println!("Config File Error: There must be a index.html in each folder.");
            return false;
        }
    }

    if content.contains_key("sub_chapters") {
        if let Some(content) = content.get("sub_chapters") {
            if let Some(content) = content.as_array() {
                for c in content {
                    if let Some(c) = c.as_object() {
                        if !verify_chapter(c, indent + 2, target) {
                            return false;
                        }
                    } else {
                        println!("Config File Error: A sub chapter must be a map type.");
                    }
                }
                return true;
            } else {
                println!("Config File Error: Sub chapter field must have an array type.");
            }
        } else {
            println!("Config File Error: Sub chapter field must have an array type.");
        }
    }

    return true;
}

fn fetch_filecontent(
    path: &PathBuf,
    f: &EmbeddedFile,
    title: &str,
    version: &str,
    url: &str,
    description: &str,
    meta_image: &str,
    prefix_str: &str,
) -> Vec<u8> {
    if let Some(ext) = path.extension() {
        if let Some(filename) = path.file_name() {
            if filename == "index.html" {
                let content = String::from_utf8_lossy(&f.data);

                let mut rendered = content.replace("{{_codestage_title_}}", title);
                rendered = rendered.replace("{{_codestage_description_}}", description);
                rendered = rendered.replace("{{_codestage_meta_image_}}", meta_image);
                rendered = rendered.replace("{{_codestage_url_}}", url);
                rendered = rendered.replace("{{_codestage_version_}}", version);

                if prefix_str.len() == 0 {
                    if let Some(_) = content.find("/$$_codestage_prefix_$$") {
                        rendered = rendered.replace("/$$_codestage_prefix_$$", "");
                    }
                }

                if let Some(_) = content.find("$$_codestage_prefix_$$") {
                    rendered = rendered.replace("$$_codestage_prefix_$$", prefix_str);
                }
                return rendered.as_bytes().to_vec();
            }
        }

        if ext == "html" || ext == "js" || ext == "css" {
            let mut content = String::from_utf8_lossy(&f.data);

            if prefix_str.len() == 0 {
                if let Some(_) = content.find("/$$_codestage_prefix_$$") {
                    content = content.replace("/$$_codestage_prefix_$$", "").into();
                }
            }

            if let Some(_) = content.find("$$_codestage_prefix_$$") {
                content = content.replace("$$_codestage_prefix_$$", prefix_str).into();
            }
            return content.as_bytes().to_vec();
        }
    }
    return f.data.to_vec();
}

fn main() -> Result<CodeStageExitCode> {
    let args = Args::parse();
    //https://patorjk.com/software/taag/#p=display&f=Ogre&t=Code%20Stage
    println!(
        "     ___          _        __ _                   
    / __\\___   __| | ___  / _\\ |_ __ _  __ _  ___ 
   / /  / _ \\ / _` |/ _ \\ \\ \\| __/ _` |/ _` |/ _ \\
  / /__| (_) | (_| |  __/ _\\ \\ || (_| | (_| |  __/
  \\____/\\___/ \\__,_|\\___| \\__/\\__\\__,_|\\__, |\\___|
                                       |___/      "
    );
    const VERSION: &str = env!("CARGO_PKG_VERSION");

    let contents =
        fs::read_to_string(args.manifest).expect("Should have been able to read the file");
    let value: Value = serde_json::from_str(&contents)?;

    if let Some(ref global) = value.as_object() {
        let mut target_folder = args.target.clone();
        if global.contains_key("target") {
            if let Some(target) = global.get("target") {
                if let Some(target_str) = target.as_str() {
                    target_folder = target_str.to_string();
                }
            }
        }

        let target_folder_exists = Path::new(&target_folder).exists();

        if !target_folder_exists {
            fs::create_dir(&target_folder)
                .expect(format!("Unable to create target folder: {}.", &target_folder).as_str());
        } else {
            let target_is_dir: bool = Path::new(&target_folder).is_dir();
            if !target_is_dir {
                return Ok(CodeStageExitCode::ERR(format!(
                    "Target {} is not a folder.",
                    &target_folder
                )));
            }
        }

        let prefix_str = if let Some(p) = args.prefix {
            p
        } else {
            String::from(
                global
                    .get("prefix")
                    .unwrap_or(&serde_json::Value::String("".to_string()))
                    .as_str()
                    .unwrap_or(""),
            )
        };

        let meta_image = if global.contains_key("meta_image") {
            let mut meta_image = String::new();
            if let Some(meta_image_value) = global.get("meta_image") {
                if let Some(meta_image_str) = meta_image_value.as_str() {
                    let meta_image_exists = Path::new(meta_image_str).exists();

                    if meta_image_exists {
                        let mut options = CopyOptions::new();
                        options.overwrite = true;
                        match fs_extra::copy_items(&[meta_image_str], &target_folder, &options) {
                            Ok(_r) => {
                                meta_image = meta_image_str.to_string();
                            }
                            Err(e) => {
                                println!(
                                    "Warning: Can't copy folder {} to {}. {}",
                                    &meta_image_str, &target_folder, &e
                                );
                            }
                        }
                    }
                }
            }
            meta_image
        } else {
            String::new()
        };

        let title = if global.contains_key("title") {
            let mut title = String::new();
            if let Some(title_value) = global.get("title") {
                if let Some(title_str) = title_value.as_str() {
                    title = title_str.to_string();
                }
            }
            title
        } else {
            String::new()
        };

        let description = if global.contains_key("description") {
            let mut description = String::new();
            if let Some(description_value) = global.get("description") {
                if let Some(description_str) = description_value.as_str() {
                    description = description_str.to_string();
                }
            }
            description
        } else {
            String::new()
        };

        let url = if global.contains_key("url") {
            let mut url = String::new();
            if let Some(url_value) = global.get("url") {
                if let Some(url_str) = url_value.as_str() {
                    url = url_str.to_string();
                }
            }
            url
        } else {
            String::new()
        };

        for file in Asset::iter() {
            println!("{}/{}", &target_folder, file.as_ref());

            let mut path = PathBuf::new();
            path.push(&target_folder);
            path.push(file.as_ref());

            let f = Asset::get(file.as_ref()).unwrap();

            println!("fetch_filecontent {:?}", path);

            let data: Vec<u8> = fetch_filecontent(
                &path,
                &f,
                &title,
                VERSION,
                &url,
                &description,
                &meta_image,
                &prefix_str,
            );

            if let Err(e) = fs::write(&path, &data) {
                println!("{:?}", e.kind());

                match e.kind() {
                    ErrorKind::NotFound => {
                        fs::create_dir_all(path.parent().unwrap()).unwrap();

                        if let Err(e) =
                            fs::write(format!("{}/{}", &target_folder, file.as_ref()), &data)
                        {
                            return Ok(CodeStageExitCode::ERR(format!(
                                "Unable to write {} {}.",
                                file.as_ref(),
                                e.kind()
                            )));
                        }
                    }
                    _ => {
                        return Ok(CodeStageExitCode::ERR(format!(
                            "Unable to write {} {}.",
                            file.as_ref(),
                            e.kind()
                        )));
                    }
                }
            }
        }

        if !global.contains_key("title") {
            return Ok(CodeStageExitCode::ERR(
                "Config File Error: Mandatory field \"title\" doesn't exist.".to_string(),
            ));
        }

        if let Some(utilities) = global.get("utilities") {
            if let Some(utility_dirs) = utilities.as_array() {
                for u in utility_dirs {
                    if let Some(u_str) = u.as_str() {
                        let mut options = CopyOptions::new();
                        options.overwrite = true;
                        let handle = |_process_info: TransitProcess| {
                            fs_extra::dir::TransitProcessResult::ContinueOrAbort
                        };
                        match fs_extra::copy_items_with_progress(
                            &[u_str],
                            &target_folder,
                            &options,
                            handle,
                        ) {
                            Ok(_r) => {}
                            Err(e) => {
                                println!(
                                    "Warning: Can't copy folder {} to {}. {}",
                                    &u_str, &target_folder, &e
                                );
                            }
                        }
                    }
                }
            }
        }

        let content = match global.get("content") {
            None => {
                return Ok(CodeStageExitCode::ERR(
                    "Warning: No content detected.".to_string(),
                ));
            }
            Some(content) => content,
        };

        if let Some(content) = content.as_array() {
            for c in content {
                if let Some(chapter) = c.as_object() {
                    if verify_chapter(chapter, 0, &target_folder) == false {
                        return Ok(CodeStageExitCode::ERR(
                            "Unable to verify chapter data".to_string(),
                        ));
                    }
                } else {
                    return Ok(CodeStageExitCode::ERR(
                        "Config File Error: A chapter needs to be a table format.".to_string(),
                    ));
                }
            }
        }

        let file = File::create(format!("{}/manifest.json", target_folder)).unwrap();
        serde_json::to_writer_pretty(file, &value).expect("Unable to write the manifest file.");
    } else {
        return Ok(CodeStageExitCode::ERR(
            "The input file doesn't contain configurations.".to_string(),
        ));
    }

    Ok(CodeStageExitCode::OK)
}
