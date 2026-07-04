import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { PatientsResolver } from './patients.resolver';
import { PatientsService } from './patients.service';

describe('PatientsModule (Service & Resolver)', () => {
  let service: PatientsService;
  let resolver: PatientsResolver;
  let repo: Repository<Patient>;

  const mockPatientId = '8f3e2db7-0a44-4860-84cf-2321287c88b9';
  const mockPatient: Patient = {
    id: mockPatientId,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-05-15',
    mrn: 'MRN001',
    createdAt: new Date(),
    notes: [],
    fullName: 'John Doe',
  };

  const mockRepo = {
    find: jest.fn().mockResolvedValue([mockPatient]),
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === mockPatientId) return Promise.resolve(mockPatient);
      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        PatientsResolver,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    resolver = module.get<PatientsResolver>(PatientsResolver);
    repo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PatientsService', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should find all patients sorted by firstName', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockPatient]);
      expect(repo.find).toHaveBeenCalledWith({ order: { firstName: 'ASC' } });
    });

    it('should find one patient by ID', async () => {
      const result = await service.findOne(mockPatientId);
      expect(result).toEqual(mockPatient);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: mockPatientId });
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('PatientsResolver', () => {
    it('should query all patients', async () => {
      const result = await resolver.findAll();
      expect(result).toEqual([mockPatient]);
    });

    it('should query one patient by ID', async () => {
      const result = await resolver.findOne(mockPatientId);
      expect(result).toEqual(mockPatient);
    });
  });
});
