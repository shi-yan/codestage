use std::io::{self, Write};
use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=Cargo.lock");
    println!("cargo:rerun-if-changed=../frontend/src");
    println!("cargo:rerun-if-changed=../frontend/package.json");

    let output = Command::new("npm")
        .current_dir("../frontend")
        .args(&["i", "--save"])
        .output()
        .expect("failed to execute process");

    println!("status: {}", output.status);

    io::stdout().write_all(&output.stdout).unwrap();
    io::stderr().write_all(&output.stderr).unwrap();

    assert!(output.status.success());

    let output2 = Command::new("npm")
        .current_dir("../frontend")
        .args(&["run", "build"])
        .output()
        .expect("failed to execute process");

    println!("status: {}", output2.status);

    io::stdout().write_all(&output2.stdout).unwrap();
    io::stderr().write_all(&output2.stderr).unwrap();

    assert!(output2.status.success());
}

