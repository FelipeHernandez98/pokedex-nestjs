import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  private defaultlimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configuService: ConfigService

  ) {

    this.defaultlimit = configuService.get<number>('defaultLimit'); // obtenemos el limite directamente de la configuración, en donde se toman de las variables de entorno
    /* const defaultlimit = configuService.get<number>('defaultLimit');
    console.log(defaultlimit) */
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = this.defaultlimit, offset = 0 } = paginationDto;

    return await this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({
        no: 1
      })
      .select('-__v')
  }

  async findOne(id: string) {
    let pokemon: Pokemon;

    if (!isNaN(+id)) {
      pokemon = await this.pokemonModel.findOne({ no: id });
    }

    if (!pokemon && isValidObjectId(id)) { //<- Verifica si ya encontro un pokemon y si es un mongoID
      pokemon = await this.pokemonModel.findById(id);
    } else {
      pokemon = await this.pokemonModel.findOne({ name: id.toLowerCase().trim() });
    }

    if (!pokemon) throw new NotFoundException(`El pokemon no existe en la BD`);

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(id);

    if (updatePokemonDto.name) updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true }); // Se agrega el true para que devuelva el objeto nuevo, si no se pone devuelve el viejo

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error)
    }

  }

  async remove(id: string) {
    /* const pokemon = await this.findOne(id);
    await pokemon.deleteOne(); */
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id })
    if (deletedCount === 0)
      throw new BadRequestException(`El pokemon con el id: ${id} no existe`);
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) { // Si es un error 11000 significa que se esta instertando un registro existente
      // Y así nos evitamos hacer otra busqueda antes para saber si el pokemon existe, sabiendo que es un error
      // 11000 significa que ya existe
      throw new BadRequestException(`El pokemon ya existe en la BD ${JSON.stringify(error.keyValue)}`);
      // Y así podemos hacer la excepcion informando que el Pokemon ya existe en la BD
    }
    console.log(error)
    throw new InternalServerErrorException(`No se pudo crear el Pokemon - Chequee los logs`);
  }
}
