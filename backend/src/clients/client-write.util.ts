import type { CreateClientDto } from './dto/create-client.dto';
import type { UpdateClientDto } from './dto/update-client.dto';

type ClientWriteDto = CreateClientDto | UpdateClientDto;

export function buildClientWriteData(dto: ClientWriteDto) {
  const firstName = dto.firstName?.trim();
  const lastName = dto.lastName?.trim();
  let name = dto.name?.trim();

  if (firstName || lastName) {
    const composed = [firstName, lastName].filter(Boolean).join(' ');
    if (composed) name = composed;
  }

  const data: Record<string, unknown> = { ...dto };

  if (name) data.name = name;
  if (dto.firstName !== undefined) data.firstName = firstName || null;
  if (dto.lastName !== undefined) data.lastName = lastName || null;
  if (dto.cinNumber !== undefined) {
    data.cinNumber = dto.cinNumber?.trim() || null;
  }
  if (dto.cinDocumentUrl !== undefined) {
    data.cinDocumentUrl = dto.cinDocumentUrl?.trim() || null;
  }
  if (dto.cinDocumentName !== undefined) {
    data.cinDocumentName = dto.cinDocumentName?.trim() || null;
  }
  if (dto.cinDocumentBackUrl !== undefined) {
    data.cinDocumentBackUrl = dto.cinDocumentBackUrl?.trim() || null;
  }
  if (dto.cinDocumentBackName !== undefined) {
    data.cinDocumentBackName = dto.cinDocumentBackName?.trim() || null;
  }
  if (dto.cinValidUntil !== undefined) {
    data.cinValidUntil = dto.cinValidUntil
      ? new Date(dto.cinValidUntil)
      : null;
  }

  return data;
}
