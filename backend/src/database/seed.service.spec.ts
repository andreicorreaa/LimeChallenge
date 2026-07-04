import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { SeedService } from './seed.service';

describe('SeedService', () => {
  let service: SeedService;
  let repo: Repository<Patient>;

  const mockRepo = {
    count: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((p) => Promise.resolve(p)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
    repo = module.get<Repository<Patient>>(getRepositoryToken(Patient));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should skip seeding if patients already exist', async () => {
    mockRepo.count.mockResolvedValue(3);

    await service.onApplicationBootstrap();

    expect(repo.count).toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('should seed patients if table is empty', async () => {
    mockRepo.count.mockResolvedValue(0);

    await service.onApplicationBootstrap();

    expect(repo.count).toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledTimes(3);
    expect(repo.save).toHaveBeenCalledTimes(3);
  });
});
