import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { SkipThrottle } from '@nestjs/throttler';
import { Patient } from './entities/patient.entity';
import { PatientsService } from './patients.service';

@SkipThrottle() // Read-only — no rate limiting needed on queries
@Resolver(() => Patient)
export class PatientsResolver {
  constructor(private readonly patientsService: PatientsService) {}

  @Query(() => [Patient], { name: 'patients', description: 'List all patients' })
  findAll(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Query(() => Patient, {
    name: 'patient',
    description: 'Get a single patient by ID',
    nullable: true,
  })
  findOne(@Args('id', { type: () => ID }) id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }
}
