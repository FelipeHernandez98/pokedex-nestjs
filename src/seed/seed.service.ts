import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()

export class SeedService {

  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');// cortamos la url por "/" para extraer el id del pokemon
      const no: number = +segments[segments.length - 2]; // convertimos a numero con el +, y buscamos en el array la penultima posición donde esta el id
      const pokeom = await this.pokemonModel.create({ name, no });
    })
    return 'Seed ejecutado correctamente!';
  }
}
