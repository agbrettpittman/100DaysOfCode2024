fn main() {
    println!("=============== Basic Loop ===============");
    let mut counter = 0;
    loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;
        }
    };
    println!("The counter is {counter}"); // prints "The result is 20"

    println!("=============== Nested loops ===============");
    let mut outer_count = 0;
    let counting_up_value = 'counting_up: loop {
        println!("count = {outer_count}");
        let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if outer_count == 2 {
                break 'counting_up remaining * outer_count;
            }
            remaining -= 1;
        }

        outer_count += 1;

    };
    println!("End count = {outer_count}");
    println!("Counting Up Value = {counting_up_value}");

    println!("=============== While loop ===============");

    let mut while_number = 3;
    while while_number != 0 {
        println!("{while_number}");
        while_number -= 1;
    };
    println!("Finished :)");


    println!("=============== For Loop ===============");
    let a = [1,2,3,4,5,6];
    let b = ["a","b", "c"];
    for element in a {
        println!("number: {element}");
    }

    for element in b {
        println!("letter: {element}")
    }

    println!("=============== loop return ===============");

    let failure_details = loop {
        // imagine regular calls to an API here
        println!("Calling API");
        break "reasons"
    };
    println!("Failed due to: {failure_details}");

}
