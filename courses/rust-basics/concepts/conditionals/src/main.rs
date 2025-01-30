fn main() {
    /*
    let age: u16 = 16;
    if age >= 18 {
        println!("You can drive a car!")
    } else {
        println!("You can't drive a car :(")
    }
    */

    let number = 6;
    if number % 4 == 0 {
        println!("Number is divisible by 4");
    } else if number % 3 == 0 {
        println!("Number is divisible by 3");
    } else if number % 2 == 0 {
        println!("Number is divisible by 2");
    } else {
        println!("Number is not divisible by 2, 3, or 4");
    }

    let condition = true;
    let other_number = if condition {5} else {6};
    println!("Other number is {}", other_number);
}
