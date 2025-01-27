fn main() {
    let s1 = String::from("RUST");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}", s1, len);

}

fn printLost(s: &String) {
    println!("{}", &s1);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
