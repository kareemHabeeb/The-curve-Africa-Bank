import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
    name: "users",
    initialState: {
        signedUpUsers: [],
        loggedInUser: null,
    },
    reducers: {
        transferFunds: (state, action) => {
            const { userID, senderAccountID, recipientAccountNumber, reciepientID, amount, memo } = action.payload;
            const sender = state.signedUpUsers.find(users => users.id === userID);
            // console.log(sender)
            const senderAccount = sender.accounts.find(account => account.id === senderAccountID);

            if(senderAccount.balance > amount) {
                // console.log(sender)
                senderAccount.balance -= amount;
                state.loggedInUser.balance -= amount;
                const recipient = state.signedUpUsers.find(user => user.id === reciepientID);
                const recipientAccount = recipient.accounts.find(account => account.accountNumber === recipientAccountNumber);
                recipientAccount.balance += amount;
                sender.transactions.push({
                    id: sender.transactions.length + 1,
                    type: "debit",
                    amount: amount,
                    memo: memo,
                    date: new Date().toISOString(),
                });

                state.loggedInUser.transactions.push({
                    id: sender.transactions.length + 1,
                    type: "debit",
                    amount: amount,
                    memo: memo,
                    date: new Date().toISOString(),
                })
                recipient.transactions.push({
                    id: recipient.transactions.length + 1,
                    type: "credit",
                    amount: amount,
                    memo: memo,
                    date: new Date().toISOString(),
                });
                alert("Funds transferred successfully");
                return state;
            } else {
                alert("Insufficient balance");
                return state;
            }
        },
        signUp: (state, action) => {
            const newUser = action.payload;
            state.signedUpUsers.push(newUser);
        },
        logIn: (state, action) => {
            const { email, password } = action.payload;
            const user = state.signedUpUsers.find(user => user.email === email && user.password === password);
            if (user) {
                state.loggedInUser = user;
                alert("Login successful");
            } else {
                alert("Invalid email or password");
            }
        },
        logOut: (state) => {
            state.loggedInUser = null;
            alert("Logged out successfully");
        },
        deleteAccount: (state, action) => {
            const userID = action.payload;
            const userIndex = state.signedUpUsers.findIndex(user => user.id === userID);
            if (userIndex !== -1) {
                state.signedUpUsers.splice(userIndex, 1);
                alert("Account deleted successfully");
            }

        },
        addNewAccount:(state, action)=>{
            const {accountName, amount} = action.payload
            const userId = state.loggedInUser.id;
            const user = state.signedUpUsers.find(user=> user.id === userId);
            const userAccounts = user.accounts;
            const amountAllowable = user.amountAllowable;

            if(!amountAllowable){
                const balance = userAccounts[0].balance;
                const allowableValue = 500000 - balance;

                if(amount < allowableValue){
                    userAccounts.push({
                    id: userAccounts.length + 1,
                    accountNumber: `ACC${Math.floor(100000 + Math.random() * 900000)}`, 
                    accountName: accountName,
                    balance: amount,
                    })

                    user.amountAllowable = 500000 - (allowableValue + amount)
                }else{
                    alert(`Your allowed amount is ${allowableValue}`)
                }

            }else if(amount < amountAllowable){
                userAccounts.push({
                    id: userAccounts.length + 1,
                    accountNumber: `ACC${Math.floor(100000 + Math.random() * 900000)}`, 
                    accountName: accountName,
                    balance: amount,
                    })
            }else{
                alert(`Your allowed amount is ${allowableValue}`)
            }
        }
    }
})

export const { transferFunds, signUp, logIn, logOut, deleteAccount, addNewAccount } = usersSlice.actions;
export default usersSlice.reducer;