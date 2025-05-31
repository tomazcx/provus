import { Module } from '@nestjs/common';
import { SignUpController } from './';
import { ServiceModule } from 'src/data/services-implementation/services.module';

@Module({
  imports: [ServiceModule],
  controllers: [SignUpController],
})
export class AuthControllersModule {}
