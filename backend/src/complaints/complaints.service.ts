import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateComplaintDto, UpdateComplaintDto } from './dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateCode(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000 + 100000);
    return `RC-${year}-${random}`;
  }

  async create(dto: CreateComplaintDto) {
    return this.prisma.complaintBook.create({
      data: { ...dto, code: this.generateCode() },
    });
  }

  async findAll(status?: string) {
    return this.prisma.complaintBook.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const complaint = await this.prisma.complaintBook.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Reclamo no encontrado');
    return complaint;
  }

  async findByCode(code: string) {
    const complaint = await this.prisma.complaintBook.findUnique({ where: { code } });
    if (!complaint) throw new NotFoundException('Reclamo no encontrado');
    return complaint;
  }

  async update(id: string, dto: UpdateComplaintDto) {
    await this.findOne(id);
    return this.prisma.complaintBook.update({
      where: { id },
      data: {
        ...dto,
        respondedAt: dto.response ? new Date() : undefined,
      },
    });
  }
}