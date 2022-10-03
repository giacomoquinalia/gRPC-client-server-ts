import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'

class GreeterService {
  async foo(a: string): Promise<string> {
    return `Hello ${a}`
  }

  async bar(b: string): Promise<string> {
    return `Hello ${b}`
  }
}

function protoAssembler(protoName: string): grpc.GrpcObject {
  const PROTO_PATH = path.join(__dirname, protoName)
  const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
  })
  return grpc.loadPackageDefinition(packageDefinition)
}

async function boot(port: string | number = 8000): Promise<void> {
  const gRPC_Object = protoAssembler('greeter.proto')

  const server = new grpc.Server()

  server.addService(
    gRPC_Object.GreeterService.service,
    new GreeterService()
  )

  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (error) => {
      if (error) {
        console.log(error)
        throw error
      }
      server.start()
      console.log(`⚡️[server]: Server grpc is running at 0.0.0.0:${port}`)
    }
  )
}

void boot()
