use proc_macro;

#[macro_export]
macro_rules! simple_vec {
    ( $( $x:expr ),* ) => {
        {
            let mut temp_vec = Vec::new();
            $(
                temp_vec.push($x);
            )*
            temp_vec
        }
    };
}

#[some_attribute]
pub fn some_name(input: TokenStream) -> TokenStream {}
