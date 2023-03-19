import { subtask } from "hardhat/config";

subtask("print", "Prints a message")
.addParam("message", "The message to print")
.setAction(async (taskArgs) => {
  console.log(taskArgs.message);
});