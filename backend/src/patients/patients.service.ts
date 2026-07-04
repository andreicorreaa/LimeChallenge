import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepo: Repository<Patient>,
  ) {}

  findAll(): Promise<Patient[]> {
    return this.patientsRepo.find({ order: { firstName: 'ASC' } });
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepo.findOneBy({ id });
    if (!patient) {
      throw new NotFoundException(`Patient with id "${id}" not found`);
    }
    return patient;
  }
}
