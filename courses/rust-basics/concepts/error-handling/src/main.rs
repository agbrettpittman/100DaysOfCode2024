/*
enum Option<T>{
    Some(T),
    None
}

enum Result<T, E>{
    Ok(T),
    Err(E)
}
*/

fn opt_divide(numerator: f64, denominator: f64) -> Option<f64>{
    if denominator == 0.0 {
        None
    } else {
        Some(numerator / denominator)
    }
}

fn res_divide(numerator: f64, denominator: f64) -> Result<f64, String>{
    if denominator == 0.0 {
        Err("Cannot divide by 0".to_string())
    } else {
        Ok(numerator/ denominator)
    }
}

fn main() {

    println!("Learning Error Handling!");

    let opt_result = opt_divide(10.0, 2.0);

    match opt_result {
        Some(x) => println!("Option Value: {}",x),
        None => println!("Option Failed: Cannot divide by 0!")
    }

    match res_divide(32.0, 2.0) {
        Ok(result) => println!("Result Value: {}", result),
        Err(e) => println!("Result Failed: {}", e)
    }


}
