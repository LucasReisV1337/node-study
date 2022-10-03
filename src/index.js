const { response } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

//Middleware
function verifyIfExistsAccountCPF(request, response, next) { 
  const { cpf } = request.headers;
    
  const customer = customers.find(customer => customer.cpf === cpf)
  
  if (!customer) { 
    return response.status(400).json({error:"Customer not found!"})
  }
  request.customer = customer // passando a const customer para as outras rotas fora do escopo

return next()

}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Custom already exists!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

//app.use(verifyIfExistsAccountCPF) Middleware geral para utilizar em todas as rotas

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request // acessando o customer do middleware
    return response.json(customer.statement)
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body

  const { customer } = request

  const statementOperation = {
    description,
    amount,
    create_at: new Date(),
    type:"credit"
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

//localhost
app.listen(1337);
