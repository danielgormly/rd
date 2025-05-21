use std::rc::Rc;
use std::cell::RefCell;

#[derive(Debug)]
struct DumbStruct {
    bork: Option<Rc<RefCell<DumbStruct>>>,
}

fn moving_shit_around() {
    let rc = Rc::new(RefCell::new(DumbStruct { bork: None }));
    {
        let mut mut_rc = rc.borrow_mut();
        mut_rc.bork = Some(rc.clone());
    }
    let borrowed = rc.borrow();
    if let Some(value) = &borrowed.bork {
        println!("{:?}", value.borrow());
    }
}

fn main() {
    moving_shit_around();
}