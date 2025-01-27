fn main() {
    hello_world();
    tell_height(182);
    human_id("Brett", 28, 182.0);

    let _X = {
        let price: i32 = 5;
        let quantity: i32 = 10;
        price * quantity
    };
    println!("The total price is: {}", _X);

    add(4,6);
    let y = add(4,6);
    println!("The value of y is: {}", y);
    println!("The value from function 'add' is: {}", add(4,6));

    let weight_kg = 70.0;
    let height_m = 1.82;

    let bmi = calculate_bmi(weight_kg, height_m);

    println!("Your BMI is: {:.2}", bmi);

    let cat = generate_cat("Whiskers");

    println!("{} is a {} {} that is {} years old", cat.0, cat.1, cat.2, cat.3);
}

fn hello_world() {
    println!("Hello, Rust!");
}

fn tell_height(height: u32) {
    println!("My height is {} cm", height);
}

fn human_id(name: &str, age: u32, height: f32) {
    println!("My name is {}, I'm {} years old, and I'm {} cm tall", name, age, height);
}

fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn calculate_bmi(weight_kg: f64, height_m: f64) -> f64{
    weight_kg / (height_m * height_m)
}

fn generate_cat(name: &str) -> (&str, &str, &str, u32) {
    let colors = ["black", "white", "orange", "grey"];
    let breeds = ["Siamese", "Persian", "Maine Coon", "Ragdoll"];
    let age:u32 = 5;
    (name,colors[0],breeds[2],age)
}