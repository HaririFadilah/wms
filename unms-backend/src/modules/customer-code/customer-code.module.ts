import { Module } from '@nestjs/common';
import { CustomerCodeService } from './customer-code.service';

/**
 * CustomerCodeModule — exports {@link CustomerCodeService} so other modules
 * (CustomerService at BE-0301, eventually anyone needing a customer code) can
 * inject it without re-instantiating PrismaClient or duplicating counter logic.
 *
 * PrismaService is global (see PrismaModule @Global()), so we do not import it here.
 */
@Module({
  providers: [CustomerCodeService],
  exports: [CustomerCodeService],
})
export class CustomerCodeModule {}
