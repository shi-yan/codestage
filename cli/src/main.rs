use clap::Parser;
use rust_embed::EmbeddedFile;
use rust_embed::RustEmbed;
use std::fs;
use std::fs::File;
use std::io::ErrorKind;
use std::path::Path;
use std::path::PathBuf;
use toml::Value;
extern crate fs_extra;
use fs_extra::dir::CopyOptions;
use fs_extra::TransitProcess;
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
    #[arg(short, long, default_value_t = String::from("codestage.toml"))]
    manifest: String,

    #[arg(short, long)]
    prefix: Option<String>,
}

fn verify_chapter(
    content: &toml::map::Map<String, toml::Value>,
    indent: usize,
    target: &str,
) -> bool {
    if !content.contains_key("title") {
        println!("Toml Format Error: A Chapter must have a title.");
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
            if let toml::Value::String(folder_str) = folder {
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
                println!("Toml Format Error: A folder must be a string.");
                return false;
            }
        }
    }

    if content.contains_key("files") {
        let mut has_seen_index = false;
        if let toml::Value::Array(files) = content.get("files").unwrap() {
            for f in files {
                if let toml::Value::Table(ref file) = f {
                    if !file.contains_key("filename") {
                        println!("Toml Format Error: A file must contain a filename.");
                        return false;
                    } else {
                        if let toml::Value::String(filename) = file.get("filename").unwrap() {
                            if filename == "index.html" {
                                has_seen_index = true;
                            }
                        } else {
                            println!("Toml Format Error: Filename must be a string.");
                            return false;
                        }
                    }
                }
            }
        }

        if has_seen_index == false {
            println!("Toml Format Error: There must be a index.html in each folder.");
            return false;
        }
    }

    if content.contains_key("sub_chapters") {
        if let toml::Value::Array(content) = content.get("sub_chapters").unwrap() {
            for c in content {
                if let toml::Value::Table(c) = c {
                    if !verify_chapter(c, indent + 2, target) {
                        return false;
                    }
                } else {
                    println!("Toml Format Error: A sub chapter must be a map type.");
                }
            }
            return true;
        } else {
            println!("Toml Format Error: Sub chapter field must have an array type.");
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
        
        if ext == "html" || ext == "js" {
            let mut content = String::from_utf8_lossy(&f.data);

            if prefix_str.len() == 0 {
                if let Some(_) = content.find("/$$_codestage_prefix_$$") {
                    content = content.replace("/$$_codestage_prefix_$$", "").into();
                }
            }

            if let Some(_) = content.find("$$_codestage_prefix_$$") {
                let rendered = content.replace("$$_codestage_prefix_$$", prefix_str);
                return rendered.as_bytes().to_vec();
            }
        }
    }
    return f.data.to_vec();
}

fn main() {
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

    let value = match contents.parse::<Value>() {
        Err(error) => {
            println!("Toml Parsing Error: {}", error.to_string());
            return;
        }
        Ok(value) => value,
    };

    if let toml::Value::Table(ref global) = value {
        let mut target_folder = args.target.clone();
        if global.contains_key("target") {
            if let Some(target) = global.get("target") {
                if let toml::Value::String(target_str) = target {
                    target_folder = target_str.clone();
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
                println!("Target {} is not a folder.", &target_folder);
                return;
            }
        }

        let prefix_str = if let Some(p) = args.prefix {
            p
        } else {
            String::from(
                global
                    .get("prefix")
                    .unwrap_or(&toml::Value::String("".to_string()))
                    .as_str()
                    .unwrap_or(""),
            )
        };

        let meta_image = if global.contains_key("meta_image") {
            let mut meta_image = String::new();
            if let Some(meta_image_value) = global.get("meta_image") {
                if let toml::Value::String(meta_image_str) = meta_image_value {
                    let meta_image_exists = Path::new(&meta_image_str).exists();

                    if meta_image_exists {
                        let mut options = CopyOptions::new();
                        options.overwrite = true;
                        match fs_extra::copy_items(&[meta_image_str], &target_folder, &options) {
                            Ok(_r) => {
                                meta_image = meta_image_str.clone();
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
                if let toml::Value::String(title_str) = title_value {
                    title = title_str.clone();
                }
            }
            title
        } else {
            String::new()
        };

        let description = if global.contains_key("description") {
            let mut description = String::new();
            if let Some(description_value) = global.get("description") {
                if let toml::Value::String(description_str) = description_value {
                    description = description_str.clone();
                }
            }
            description
        } else {
            String::new()
        };

        let url = if global.contains_key("url") {
            let mut url = String::new();
            if let Some(url_value) = global.get("url") {
                if let toml::Value::String(url_str) = url_value {
                    url = url_str.clone();
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
                            println!("Unable to write {} {}.", file.as_ref(), e.kind());
                            return;
                        }
                    }
                    _ => {
                        println!("Unable to write {} {}.", file.as_ref(), e.kind());
                        return;
                    }
                }
            }
        }

        if !global.contains_key("title") {
            println!("Toml Format Error: Mandatory field \"title\" doesn't exist.");
            return;
        }

        if let Some(utilities) = global.get("utilities") {
            if let toml::Value::Array(ref utility_dirs) = utilities {
                for u in utility_dirs {
                    if let toml::Value::String(u_str) = u {
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
                println!("Warning: No content detected.");
                return;
            }
            Some(content) => content,
        };

        if let toml::Value::Array(ref content) = content {
            for c in content {
                if let toml::Value::Table(ref chapter) = c {
                    if verify_chapter(chapter, 0, &target_folder) == false {
                        return;
                    }
                } else {
                    println!("Toml Format Error: A chapter needs to be a table format.");
                }
            }
        }

        let file = File::create(format!("{}/manifest.json", target_folder)).unwrap();
        serde_json::to_writer_pretty(file, &value).expect("Unable to write the manifest file.");
    } else {
        println!("The input file doesn't contain configurations.");
        return;
    }
}
