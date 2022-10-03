import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { promisify } from 'util'

/**
 * Creating a client and promisifying its methods
 */
export type ClientDefinition =
  | grpc.GrpcObject
  | grpc.ServiceClientConstructor
  | grpc.ProtobufTypeDefinition

export interface InputClientAssembler {
  serviceName: string
  protofileName: string
  address: string
  credentials?: grpc.ChannelCredentials
}

export function clientAssembler<T = unknown>({
  serviceName,
  protofileName,
  address,
  credentials = grpc.credentials.createInsecure()
}: InputClientAssembler): grpc.GrpcObject & T {
  const PROTO_PATH = path.join(__dirname, protofileName)

  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
  })

  const proto = grpc.loadPackageDefinition(
    packageDefinition
  ) as ClientDefinition

  const client = new proto[serviceName](address, credentials)

  promisifyClientMethods(client)

  return client
}

const promisifyClientMethods = (client: ClientDefinition): void => {
  const clientMethods = Reflect.getPrototypeOf(client) as object

  Object.entries(clientMethods).forEach(([prop, value]) => {
    if (typeof value === 'function') {
      client[prop] = promisify(value)
    }
  })
}

/**
 * Using the client
 */
interface ServiceMethods {
  foo(a: string): Promise<string>
  bar(b: string): Promise<string>
}

const Client = clientAssembler<ServiceMethods>({
  serviceName: 'Greeter',
  protofileName: 'greeter.proto',
  address: 'localhost:50051'
})

// await Client.bar('bar')
