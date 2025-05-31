import { Module } from '@nestjs/common'
import { Env } from './env'

@Module({
  providers: [Env],
  exports: [Env],
})
export class SharedModule {}
