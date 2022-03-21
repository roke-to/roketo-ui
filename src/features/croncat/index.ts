// import * as nearApi from 'near-api-js';
// import BigNumber from 'bignumber.js';
//
// const GAS_SIZE = '250000000000000';
//
// export const LOW_DEPOSIT = new Error('Deposit it too small.');
//
// export function cadenceString({
//   minute, hour, monthDay, month, weekDay,
// }) {
//   const part = (value) => value || '*';
//   return `${part(minute)} ${part(hour)} ${part(monthDay)} ${part(
//     monthDay,
//   )} ${part(month)} ${part(weekDay)}`;
// }
//
// export class Croncat {
//   constructor({
//     near, wallet, operationalCommission, contractId,
//   }) {
//     if (!wallet || !operationalCommission || !contractId) return;
//
//     this._accountId = wallet.getAccountId();
//     this._near = near;
//     this._targetContractId = contractId;
//     this._operationalCommission = operationalCommission;
//     this._contract = new nearApi.Contract(wallet.account(), 'cron.in.testnet', {
//       viewMethods: [
//         'get_task',
//         'get_all_tasks',
//         'get_tasks',
//         'get_total_tasks_per_agent_per_slot',
//       ],
//       changeMethods: ['create_task', 'update_task'],
//     });
//   }
//
//   async getTask(hash) {
//     const res = await this._contract.get_task({ task_hash: hash });
//
//     return res;
//   }
//
//   /**
//    * `contract_id` AccountId Account to direct all execution calls against
//    * `function_id` String Contract method this task will be executing
//    * `cadence` String Crontab Spec String. Defines the interval spacing of execution
//    * `recurring` Boolean Defines if this task can continue until balance runs out
//    * `deposit` u128 Configuration of NEAR balance to send to each function call.
//    *    This is the "amount" for a function call.
//    * `gas` u64 Configuration of NEAR balance to attach to each function call.
//    *    This is the "gas" for a function call.
//    * `arguments` Vec NOTE: Only allow static pre-defined bytes,
//    *    most useful for cross-contract task creation
//    * @param {*} param0
//    */
//   async createTask({ cadence, amount }) {
//     if (amount < this._operationalCommission) {
//       throw LOW_DEPOSIT;
//     }
//
//     const dep = new BigNumber(this._operationalCommission)
//       .plus(new Date().getTime())
//       .toFixed();
//
//     const deposit = dep;
//
//     console.debug('Create Task', {
//       cadence,
//       amount,
//       deposit,
//     });
//
//     await this._contract.create_task(
//       {
//         contract_id: this._targetContractId,
//         function_id: 'update_account',
//         cadence,
//         recurring: true,
//         deposit,
//         gas: Number(GAS_SIZE),
//         arguments: [],
//       },
//       GAS_SIZE,
//       amount,
//     );
//   }
//
//   async updateTask({ hash, cadence, amount }) {
//     if (amount < this._operationalCommission) {
//       throw LOW_DEPOSIT;
//     }
//
//     await this._contract.update_task(
//       {
//         task_hash: hash,
//         contract_id: this._targetContractId,
//         function_id: 'update_account',
//         cadence,
//         recurring: true,
//         deposit: this._operationalCommission + new Date().getTime(),
//         gas: GAS_SIZE,
//         arguments: [],
//       },
//       GAS_SIZE,
//       amount,
//     );
//   }
//
//   async getAllTasks() {
//     const res1 = await this._contract.get_all_tasks();
//     const myTasks = res1.filter((t) => t.owner_id === this._accountId);
//
//     return myTasks;
//   }
// }
export {}
