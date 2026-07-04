import { Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';

const SEED_PATIENTS: Omit<Patient, 'id' | 'createdAt' | 'notes' | 'fullName'>[] = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    dateOfBirth: '1958-03-15',
    mrn: 'P001',
  },
  {
    firstName: 'Robert',
    lastName: 'Chen',
    dateOfBirth: '1972-11-22',
    mrn: 'P002',
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    dateOfBirth: '1945-07-08',
    mrn: 'P003',
  },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepo: Repository<Patient>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.patientsRepo.count();

    if (count > 0) {
      this.logger.log(`Database already seeded (${count} patients found). Skipping.`);
      return;
    }

    this.logger.log('Seeding database with mock patients...');
    for (const data of SEED_PATIENTS) {
      const patient = this.patientsRepo.create(data);
      await this.patientsRepo.save(patient);
    }
    this.logger.log(`Seeded ${SEED_PATIENTS.length} patients successfully.`);
  }
}
