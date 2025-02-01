fn main() {
    enum IpAddrKind {
        V4(u8,u8,u8,u8),
        V6(String)
    }

    let home = IpAddrKind::V4(127,0,0,1);
    let loopback: IpAddrKind = IpAddrKind::V6(String::from("::1"));
    /*

    fn route (ip_kind: IpAddrKind){
        println!("ip kind is {}", ip_kind)
    }

    route(IpAddrKind::V4);
    route(IpAddrKind::V6);
    struct IpAddr {
        kind: IpAddrKind,
        address: String
    }
    
    let home = IpAddr {
        kind: IpAddrKind::V4,
        address: String::from("127.0.0.1")
    };
    
    let loopback = IpAddr {
        kind: IpAddrKind::V6,
        address: String::from("::1")
    };
    */

}
