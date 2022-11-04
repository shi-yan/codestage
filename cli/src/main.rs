use std::env;
use std::fs;
use std::io::{self, Read};
use toml::map::Map;
use toml::Value;
use std::fs::File;

fn verify_chapter(content: &toml::map::Map<String, toml::Value>, indent: usize) -> bool {
    if !content.contains_key("title") {
        println!("Toml Format Error: A Chapter must have a title.");
        return false;
    }
    else {
        println!("{:indent$}{}","", content.get("title").unwrap(), indent=indent);
    }

    if !content.contains_key("folder") {
        println!("Toml Format Error: A Chapter must have a folder.");
        return false;
    }

    if !content.contains_key("files") {
        println!("Toml Format Error: A Chapter must have a file list.");
        return false;
    }
    else {
        if let toml::Value::Array(files) = content.get("files").unwrap() {
            for f in files {
                if let toml::Value::Table(ref file) = f {
                    if !file.contains_key("filename") {
                        println!("Toml Format Error: A file must contain a filename.");
                        return false;
                    }
                }
            }
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
    //https://patorjk.com/software/taag/#p=display&f=Ogre&t=Code%20Stage
    println!(
        "     ___          _        __ _                   
    / __\\___   __| | ___  / _\\ |_ __ _  __ _  ___ 
   / /  / _ \\ / _` |/ _ \\ \\ \\| __/ _` |/ _` |/ _ \\
  / /__| (_) | (_| |  __/ _\\ \\ || (_| | (_| |  __/
  \\____/\\___/ \\__,_|\\___| \\__/\\__\\__,_|\\__, |\\___|
                                       |___/      "
    );

    let contents = fs::read_to_string("test.toml").expect("Should have been able to read the file");

    let value = match contents.parse::<Value>() {
        Err(error) => {
            println!("Toml Parsing Error: {}", error.to_string());
            return;
        }
        Ok(value) => value,
    };

    if let toml::Value::Table(ref global) = value {
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
