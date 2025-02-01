fn main() {
    first_vec();
    indexing();
}

fn first_vec() {
    let _v:Vec<i32> = Vec::new();
    let mut _the_vec:Vec<i32> = vec![1,2,3,4];

    _the_vec.push(5);
    _the_vec.push(6);
    _the_vec.push(7);
    _the_vec.push(8);
    _the_vec.push(9);
    _the_vec.push(10);

    println!("{:?}", _the_vec);
}

fn indexing() {
    let _v = vec![1,2,3,4,5,6];

    let third = &_v[2];
    println!("The third element is {}", third);
    
    match _v.get(3) {
        Some(fourth) => println!("The fourth element is {fourth}"),
        None => println!("There is no fourth element")
    }
}