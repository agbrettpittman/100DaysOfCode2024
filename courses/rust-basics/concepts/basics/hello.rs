fn main() {
    let x: i32 = -42;
    let y: u64 = 100;
    println!("Signed Integer: {}", x);
    println!("Unsigned Integer: {}", y);

    let e: i32 = 2147483646;
    let i: i64 = 9223372036854775806;
    println!("Signed Integer: {}", e);
    println!("Signed Integer: {}", i);

    let pi: f64 = 3.14;
    println!("Value of pi: {}", pi);

    let is_snowing: bool = true;
    println!("Is it snowing? {}", is_snowing);

    let letter: char = 'a';
    println!("First letter of the alphabet: {}", letter);

    let numbers:[i32;5] = [1,2,3,4,5];
    println!("Number Array: {:?}", numbers);

    //let mix = [1,2, "apple", true];
    //println!("Mixed Array: {:?}", mix);

    let fruits: [&str;3] = ["apple", "banana", "orange"];
    println!("Fruits Array: {:?}", fruits);
    println!("First Fruit: {}", fruits[0]);
    println!("Second Fruit: {}", fruits[1]);
    println!("Third Fruit: {}", fruits[2]);

    let human: (String, i32, bool) = ("Alice".to_string(), 30, false);
    println!("Human Tuple: {:?}", human);

    let my_mix_tuple = ("Kratos", 23, true, [1,2,3,4,5]);
    println!("Mixed Tuple: {:?}", my_mix_tuple);

    let number_slices:&[i32] = &[1,2,3,4,5];
    println!("Number Slices: {:?}", number_slices);

    let animal_slices:&[&str] = &["Lion", "Elephant", "Crocodile"];
    println!("Animal Slices: {:?}", animal_slices);

    let book_slices:&[&String] = &[&"IT".to_string(), &"Harry Potter".to_string(), &"ZEN".to_string()];
    println!("Book Slices: {:?}", book_slices);

    let mut stone_cold: String = String::from("Hell, ");
    stone_cold.push_str("Yeah!");
    println!("Stone Cold says: {}", stone_cold);

    let string: String = String::from("Hello, World!");
    let slice: &str = &string[0..5];
    println!("String: {}", string);
    println!("Slice: {}", slice);
}

fn print() {
    println!("SLICE {}", slice);
}