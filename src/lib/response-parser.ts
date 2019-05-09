import {
  ActionMap,
  GraphQLActionTrace,
  GraphQLTransactionTrace
} from "./models";

/**
 * parseResponseFromGraphQL:
 * parses the transaction trace from the backend and fills an actionsMap bucket with it
 * returns the actionsMap
 * the 'undo' property relates to the block irreversibility and controls the incrementation
 **/
export function parseResponseFromGraphQL(
  actionsMap  : any,
  data: GraphQLTransactionTrace,
  undo: boolean
) {
  data.executedActions.map((action: GraphQLActionTrace) => {
   // const key = `${action.account}:${action.name}`;
   // const increment = undo ? -1 : 1;

  if  (action.name === 'act') {
     actionsMap.unshift([action.account,  action.name, action.data.table_id,   action.data.name, action.data.act.act_,action.data.act.bet_]);
   }  else {

     actionsMap.unshift([action.account,  action.name, action.data.table_id,  action.data.name,  null, null]);
  }

   if (actionsMap.length > 20 ) { actionsMap.pop()  }
    //actionsMap.unshift(   {user : action.account , act : action.name , data : action.data , table: action.data.table_id}   );
  });

  return actionsMap;
}

/**
 * sortActions:
 * sorts the action counts in descending order
**/
export function sortActions(actionsMap: ActionMap) {
  return Object.keys(actionsMap).sort(function(a, b) {
    return actionsMap[b] - actionsMap[a];
  });
}
