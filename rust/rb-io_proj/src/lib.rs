//! # io_proj
//! A grep clone.<br />
//! Not very interesting.

use std::env;
use std::error::Error;
use std::fs;

pub fn run(config: Config) -> Result<(), Box<dyn Error>> {
    println!("Searching for '{}' in '{}'", config.query, config.file_path);

    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };
    for line in results {
        println!("{line}");
    }
    Ok(())
}

pub struct Config {
    query: String,
    file_path: String,
    ignore_case: bool,
}

impl Config {
    pub fn build(mut args: impl Iterator<Item = String>) -> Result<Config, &'static str> {
        args.next();
        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };
        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file path"),
        };
        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}

/// This is run when we hit cargo test
///
/// # Examples
/// ```
/// use io_proj::search;
/// let query = String::from("Hello");
/// let contents = String::from("Hello friends");
/// search(&query, &contents);
/// ```
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents
        .lines()
        .filter(|line| line.contains(query))
        .collect()
}

pub fn search_case_insensitive<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();
    let lower_case = query.to_lowercase();
    for line in contents.lines() {
        if line.to_lowercase().contains(&lower_case) {
            results.push(line);
        }
    }
    results
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "DUCK";
        let contents = "\
Rust:
safe, fast, proDUCKtive.
Duck you, idiot.";
        assert_eq!(vec!["safe, fast, proDUCKtive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, proDUCKtive.
Trust me, idiot.";
        assert_eq!(
            vec!["Rust:", "Trust me, idiot."],
            search_case_insensitive(query, contents)
        );
    }
}
