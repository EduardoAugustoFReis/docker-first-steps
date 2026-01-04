import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { HashingService } from 'src/common/hash/hash.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  create = async (createUserDto: CreateUserDto) => {
    const passwordHashed = await this.hashingService.hash(
      createUserDto.password,
    );

    const newUser = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        password: passwordHashed,
        name: createUserDto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });

    return newUser;
  };

  listAll = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [total, users] = await this.prismaService.$transaction([
      this.prismaService.user.count(),
      this.prismaService.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          role: true,
        },
      }),
    ]);

    return {
      page,
      total,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    };
  };

  listOne = async (id: number) => {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  };

  delete = async (id: number) => {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    await this.prismaService.user.delete({
      where: { id: user.id },
    });

    return { message: 'Usuário deletado.' };
  };

  update = async (id: number, updateUserDto: UpdateUserDto) => {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    let password = updateUserDto.password;
    if (updateUserDto.password) {
      password = await this.hashingService.hash(updateUserDto.password);
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        email: updateUserDto.email ?? user.email,
        name: updateUserDto.name ?? user.name,
        password: password,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        role: true,
      },
    });

    return { message: 'Usuário atualizado', updatedUser };
  };

  async promoteToNutritionist(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role === 'NUTRITIONIST') {
      throw new BadRequestException('Usuário já é nutricionista');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException('ADMIN não pode ser rebaixado/promovido');
    }

    const update = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        role: 'NUTRITIONIST',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return { message: 'Promovido a nutricionista', update };
  }
}
