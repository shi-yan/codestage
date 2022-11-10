#[macro_use]
extern crate mustache;

use clap::Parser;
use rust_embed::RustEmbed;
use std::env;
use std::fs;
use std::fs::File;
use std::io::{self, Read};
use toml::map::Map;
use toml::Value;
use std::path::Path;
use mustache::MapBuilder;


#[derive(RustEmbed)]
#[folder = "dist/"]
struct Asset;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Output folder
    #[arg(short, long, default_value_t = String::from("target"))]
    target: String,

    /// Manifest file
    #[arg(short, long, default_value_t = String::from("codestage.toml"))]
    manifest: String,

    #[arg(short, long)]
    prefix: Option<String>,
}

fn verify_chapter(content: &toml::map::Map<String, toml::Value>, indent: usize) -> bool {
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

    /*if !content.contains_key("folder") {
        println!("Toml Format Error: A Chapter must have a folder.");
        return false;
    }*/

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
                    if !verify_chapter(c, indent + 2) {
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

fn main() {
    let args = Args::parse();
    let template = mustache::compile_str("hello {{name}}").unwrap();


    //https://patorjk.com/software/taag/#p=display&f=Ogre&t=Code%20Stage
    println!(
        "     ___          _        __ _                   
    / __\\___   __| | ___  / _\\ |_ __ _  __ _  ___ 
   / /  / _ \\ / _` |/ _ \\ \\ \\| __/ _` |/ _` |/ _ \\
  / /__| (_) | (_| |  __/ _\\ \\ || (_| | (_| |  __/
  \\____/\\___/ \\__,_|\\___| \\__/\\__\\__,_|\\__, |\\___|
                                       |___/      "
    );

    let contents = fs::read_to_string(args.manifest).expect("Should have been able to read the file");

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
            fs::create_dir(&target_folder).expect(format!("Unable to create target folder: {}.", &target_folder).as_str());
        }
        else {
            let target_is_dir: bool = Path::new(&target_folder).is_dir();
            if !target_is_dir {
                println!("Target {} is not a folder.", &target_folder);
                return;
            }
        }

        for file in Asset::iter() {
            println!("{}", file.as_ref());
        }

        if !global.contains_key("title") {
            println!("Toml Format Error: Mandatory field \"title\" doesn't exist.");
            return;
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
                    if verify_chapter(chapter, 0) == false {
                        return;
                    }
                } else {
                    println!("Toml Format Error: A chapter needs to be a table format.");
                }
            }
        }
    } else {
        println!("Toml Format Error: The input file doesn't contain configurations.");
        return;
    }

    //println!("{:?}", value);
    let mut file = File::create("manifest.json").unwrap();

    serde_json::to_writer_pretty(file, &value).unwrap();
    //assert_eq!(value["foo"].as_str(), Some("bar"));
}
