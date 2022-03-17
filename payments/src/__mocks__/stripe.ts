export const stripe = {
    charges:{
        create:jest.fn().mockResolvedValue({})  // we are mock the real create function
        // and as you see is returns a promise and that is way we are using mockResolvedValue() to return a success promise with an
        //empty object
    }
}