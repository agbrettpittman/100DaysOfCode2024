fn main() {
    let s = "whatever".to_string();
    let other_s = String::from("other whatever");
    let mut YAS = String::from("yas");
    YAS.push_str(" queen");
    YAS.push('!');
    println!("Value of s | {s}");
    println!("Value of other S | {other_s}");
    println!("Value of yet another s | {YAS}");

}
