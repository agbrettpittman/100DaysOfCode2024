fn main() {
    let rect = (200,500);

    struct Book {
        title: String,
        author: String,
        pages: u32,
        available:bool
    }

    struct User {
        active: bool,
        username: String,
        email: String,
        sign_in_count: u64
    }

    let mut user1 = User {
        active: true,
        username: String::from("bpittman"),
        email: String::from("agbrettpittman@gmail.com"),
        sign_in_count: 1
    };

    user1.email = String::from("myemail@gmail.com");
    println!("User email is {}", user1.email);

    fn build_user(email: String, username: String) -> User {
        User {
            active: true,
            email,
            username,
            sign_in_count: 1
        }
    };

    let user2 = User {
        email: String::from("anotherEmail@gmail.com"),
        ..user1
    };

    println!("user2 email: {}", user2.email);

    struct Color(i32, i32, i32);

    let black: Color = Color(0,0,0);
    let white: Color = Color(255,255,255);

    struct AlwaysEqual;

    let subject: AlwaysEqual = AlwaysEqual;


}
