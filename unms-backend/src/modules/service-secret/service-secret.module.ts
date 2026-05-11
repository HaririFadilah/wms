import { Module } from '@nestjs/common';
import { ServiceSecretGenerator } from './service-secret.generator';

/**
 * ServiceSecretModule — exports {@link ServiceSecretGenerator}.
 *
 * Used by BE-0401 ServiceService.create when allocating PPPoE credentials for
 * a new service row. PrismaService is global so we don't import it here.
 */
@Module({
  providers: [ServiceSecretGenerator],
  exports: [ServiceSecretGenerator],
})
export class ServiceSecretModule {}
