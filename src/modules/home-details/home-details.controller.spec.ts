import { Test, TestingModule } from '@nestjs/testing'

import { HomeDetailsController } from './home-details.controller'
import { HomeDetailsService } from './home-details.service'

describe('HomeDetailsController', () => {
  let controller: HomeDetailsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeDetailsController],
      providers: [HomeDetailsService],
    }).compile()

    controller = module.get<HomeDetailsController>(HomeDetailsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
