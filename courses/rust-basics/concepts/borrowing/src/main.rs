fn main() {
    simple_borrowing_example();
    struct_bottowing_example();
}

fn simple_borrowing_example() {
    let mut _x:i32 = 5;
    let _r: &mut i32 = &mut _x;
    *_r += 1;
    *_r -= 3;
    println!("Value of _x: {}", _x);
}

fn struct_bottowing_example() {
    let mut account = BankAccount {
        owner: "Alice".to_string(),
        balance: 150.55
    };

    account.check_balance();

    account.withdraw(45.5);

    account.check_balance();

}

struct BankAccount {
    owner: String,
    balance: f64
}

impl BankAccount {
    fn withdraw(&mut self, amount:f64) {
        println!("Withdrawing {} from account owned by {}", amount, self.owner);
        self.balance -= amount;
    }

    fn check_balance(&self) {
        println!("Account owned by {} has a balance of {}", self.owner, self.balance);
    }
}