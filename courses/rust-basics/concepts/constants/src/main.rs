fn main() {
    println!("Hello, world!");
    let mut x = 5;
    const Y:i32 = 10;
    println!("X = {} | Y = {} | Pi = {}", x, Y, PI);
    println!("Three hours in seconds: {}", THREE_HOURS_IN_SECONDS)
}

const PI:f64 = 3.141592653;

const THREE_HOURS_IN_SECONDS:u32 = 60 * 60 * 3;