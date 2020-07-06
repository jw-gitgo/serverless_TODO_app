import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { decode } from 'jsonwebtoken';
import { JwtPayload } from '../../auth/JwtPayload';

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const decodedJwt = decode(jwtToken) as JwtPayload
  const userId = decodedJwt.sub;

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object

  // Check if todo already exists
  if (!(await docClient.get({
    TableName: this.todosTable,
    Key: {
      todoId,
      userId
    }
  }).promise())) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Item does not exist'
      })
    };
  }

  //perform the update
  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId,
      userId
    },
    UpdateExpression: 'set #name = :n, #dueDate = :due, #done = :d',
    ExpressionAttributeValues: {
      ':n': updatedTodo.name,
      ':due': updatedTodo.dueDate,
      ':d': updatedTodo.done
    },
    ExpressionAttributeNames: {
      '#name': 'name',
      '#dueDate': 'dueDate',
      '#done': 'done'
    }
  }).promise();
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
    })
  }
}
