import { gql } from "apollo-boost";

/**
* subscribeTransactions:
* Subscription query to connect to the transaction stream
* $cursor: pagination cursor, can be saved to be reused in case of disconnection
* $lowBlockNum: starting block num, a negative number means fetching the past N blocks
**/
export const subscribeTransactions = gql`
  
  subscription subscribeTransactions($cursor: String, $lowBlockNum: Int64) {
    searchTransactionsForward(
      query: "account:dcdpcontract"
      lowBlockNum: $lowBlockNum
      cursor: $cursor
    ) {
      cursor
      trace {
        status
        block {
          id
          num
          timestamp
        }
        id
        executedActions {
          name 
          receiver
          account
          data
          
        }
      }
    }
  }
`;
