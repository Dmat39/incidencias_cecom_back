import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogosService {
  constructor(private prisma: PrismaService) {}

  // ─── UNIDADES ──────────────────────────────────────────────────────────────
  findUnidades(soloHabilitados = true) {
    return this.prisma.unidad.findMany({
      where: soloHabilitados ? { habilitado: true } : {},
      orderBy: { descripcion: 'asc' },
    });
  }
  createUnidad(data: any) { return this.prisma.unidad.create({ data }); }
  updateUnidad(id: number, data: any) { return this.prisma.unidad.update({ where: { id }, data }); }
  removeUnidad(id: number) { return this.prisma.unidad.delete({ where: { id } }); }

  // ─── TIPO CASOS ────────────────────────────────────────────────────────────
  async findTipoCasos(unidadId?: number) {
    // Si se filtra por unidad y existen tipo_casos para esa unidad, devolverlos.
    // Si no existen (p.ej. POLICÍA usa los mismos tipos que SERENAZGO), devolver todos.
    if (unidadId) {
      const filtered = await this.prisma.tipoCaso.findMany({
        where: { habilitado: true, unidadId },
        include: { unidad: true },
        orderBy: { codigo: 'asc' },
      });
      if (filtered.length > 0) return filtered;
    }
    return this.prisma.tipoCaso.findMany({
      where: { habilitado: true },
      include: { unidad: true },
      orderBy: { codigo: 'asc' },
    });
  }
  createTipoCaso(data: any) { return this.prisma.tipoCaso.create({ data }); }
  updateTipoCaso(id: number, data: any) { return this.prisma.tipoCaso.update({ where: { id }, data }); }
  removeTipoCaso(id: number) { return this.prisma.tipoCaso.delete({ where: { id } }); }

  // ─── SUBTIPO CASOS ─────────────────────────────────────────────────────────
  findSubTipoCasos(tipoCasoId?: number) {
    return this.prisma.subTipoCaso.findMany({
      where: { habilitado: true, ...(tipoCasoId ? { tipoCasoId } : {}) },
      include: { tipoCaso: true },
      orderBy: { codigo: 'asc' },
    });
  }
  createSubTipoCaso(data: any) { return this.prisma.subTipoCaso.create({ data }); }
  updateSubTipoCaso(id: number, data: any) { return this.prisma.subTipoCaso.update({ where: { id }, data }); }
  removeSubTipoCaso(id: number) { return this.prisma.subTipoCaso.delete({ where: { id } }); }

  // ─── JURISDICCIONES ────────────────────────────────────────────────────────
  findJurisdicciones() {
    return this.prisma.jurisdiccion.findMany({
      where: { habilitado: true },
      orderBy: { nombre: 'asc' },
    });
  }
  createJurisdiccion(data: any) { return this.prisma.jurisdiccion.create({ data }); }
  updateJurisdiccion(id: number, data: any) { return this.prisma.jurisdiccion.update({ where: { id }, data }); }
  removeJurisdiccion(id: number) { return this.prisma.jurisdiccion.delete({ where: { id } }); }

  // ─── MEDIOS ────────────────────────────────────────────────────────────────
  findMedios() {
    return this.prisma.medioReporte.findMany({
      where: { habilitado: true },
      orderBy: { descripcion: 'asc' },
    });
  }
  createMedio(data: any) { return this.prisma.medioReporte.create({ data }); }
  updateMedio(id: number, data: any) { return this.prisma.medioReporte.update({ where: { id }, data }); }
  removeMedio(id: number) { return this.prisma.medioReporte.delete({ where: { id } }); }

  // ─── OPERADORES ────────────────────────────────────────────────────────────
  async findOperadores(medioId?: number) {
    if (medioId) {
      const filtered = await this.prisma.operador.findMany({
        where: { habilitado: true, medioId },
        include: { medio: true },
        orderBy: { descripcion: 'asc' },
      });
      if (filtered.length > 0) return filtered;
    }
    return this.prisma.operador.findMany({
      where: { habilitado: true },
      include: { medio: true },
      orderBy: { descripcion: 'asc' },
    });
  }
  createOperador(data: any) { return this.prisma.operador.create({ data }); }
  updateOperador(id: number, data: any) { return this.prisma.operador.update({ where: { id }, data }); }
  removeOperador(id: number) { return this.prisma.operador.delete({ where: { id } }); }

  // ─── ESTADO INCIDENCIAS ────────────────────────────────────────────────────
  findEstadoIncidencias() {
    return this.prisma.estadoIncidencia.findMany({ where: { habilitado: true } });
  }
  createEstadoIncidencia(data: any) { return this.prisma.estadoIncidencia.create({ data }); }
  updateEstadoIncidencia(id: number, data: any) { return this.prisma.estadoIncidencia.update({ where: { id }, data }); }
  removeEstadoIncidencia(id: number) { return this.prisma.estadoIncidencia.delete({ where: { id } }); }

  // ─── SEVERIDADES ───────────────────────────────────────────────────────────
  findSeveridades() {
    return this.prisma.severidad.findMany({ where: { habilitado: true } });
  }
  createSeveridad(data: any) { return this.prisma.severidad.create({ data }); }
  updateSeveridad(id: number, data: any) { return this.prisma.severidad.update({ where: { id }, data }); }
  removeSeveridad(id: number) { return this.prisma.severidad.delete({ where: { id } }); }

  // ─── CARGO SERENOS ─────────────────────────────────────────────────────────
  findCargoSerenos() {
    return this.prisma.cargoSereno.findMany({ where: { habilitado: true } });
  }
  createCargoSereno(data: any) { return this.prisma.cargoSereno.create({ data }); }
  updateCargoSereno(id: number, data: any) { return this.prisma.cargoSereno.update({ where: { id }, data }); }
  removeCargoSereno(id: number) { return this.prisma.cargoSereno.delete({ where: { id } }); }

  // ─── TIPO REPORTANTES ──────────────────────────────────────────────────────
  findTipoReportantes() {
    return this.prisma.tipoReportante.findMany({ where: { habilitado: true } });
  }
  createTipoReportante(data: any) { return this.prisma.tipoReportante.create({ data }); }
  updateTipoReportante(id: number, data: any) { return this.prisma.tipoReportante.update({ where: { id }, data }); }
  removeTipoReportante(id: number) { return this.prisma.tipoReportante.delete({ where: { id } }); }

  // ─── ESTADO PROCESOS ───────────────────────────────────────────────────────
  findEstadoProcesos() {
    return this.prisma.estadoProceso.findMany({ orderBy: { descripcion: 'asc' } });
  }
  createEstadoProceso(data: any) { return this.prisma.estadoProceso.create({ data }); }
  updateEstadoProceso(id: number, data: any) { return this.prisma.estadoProceso.update({ where: { id }, data }); }
  removeEstadoProceso(id: number) { return this.prisma.estadoProceso.delete({ where: { id } }); }

  // ─── GENERO AGRESOR ────────────────────────────────────────────────────────
  findGeneroAgresor() {
    return this.prisma.generoAgresor.findMany({ orderBy: { descripcion: 'asc' } });
  }
  createGeneroAgresor(data: any) { return this.prisma.generoAgresor.create({ data }); }
  updateGeneroAgresor(id: number, data: any) { return this.prisma.generoAgresor.update({ where: { id }, data }); }
  removeGeneroAgresor(id: number) { return this.prisma.generoAgresor.delete({ where: { id } }); }

  // ─── GENERO VICTIMA ────────────────────────────────────────────────────────
  findGeneroVictima() {
    return this.prisma.generoVictima.findMany({ orderBy: { descripcion: 'asc' } });
  }
  createGeneroVictima(data: any) { return this.prisma.generoVictima.create({ data }); }
  updateGeneroVictima(id: number, data: any) { return this.prisma.generoVictima.update({ where: { id }, data }); }
  removeGeneroVictima(id: number) { return this.prisma.generoVictima.delete({ where: { id } }); }

  // ─── SEVERIDAD PROCESOS ────────────────────────────────────────────────────
  findSeveridadProcesos() {
    return this.prisma.severidadProceso.findMany({ orderBy: { descripcion: 'asc' } });
  }
  createSeveridadProceso(data: any) { return this.prisma.severidadProceso.create({ data }); }
  updateSeveridadProceso(id: number, data: any) { return this.prisma.severidadProceso.update({ where: { id }, data }); }
  removeSeveridadProceso(id: number) { return this.prisma.severidadProceso.delete({ where: { id } }); }

  // ─── DELITOS ───────────────────────────────────────────────────────────────
  findDelitos() {
    return this.prisma.delito.findMany({
      include: { jurisdiccion: true, tipoDelito: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  createDelito(data: any) { return this.prisma.delito.create({ data }); }
  updateDelito(id: number, data: any) { return this.prisma.delito.update({ where: { id }, data }); }
}
