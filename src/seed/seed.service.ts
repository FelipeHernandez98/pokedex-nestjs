import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()

export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) { }

  async executeSeed() {

    this.pokemonModel.deleteMany({});//Nos encargamos de eliminar lo que haya en la BD

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=100');

    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach(async ({ name, url }) => {

      const segments = url.split('/');// cortamos la url por "/" para extraer el id del pokemon
      const no: number = +segments[segments.length - 2]; // convertimos a numero con el +, y buscamos en el array la penultima posición donde esta el id

      pokemonToInsert.push({ name, no });

    })

    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed ejecutado correctamente!';
  }
}
