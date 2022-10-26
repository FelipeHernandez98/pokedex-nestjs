import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()

export class SeedService {

  private readonly axios: AxiosInstance = axios;

  async executeSeed() {
    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');// cortamos la url por "/" para extraer el id del pokemon
      const no: number = +segments[segments.length - 2]; // convertimos a numero con el +, y buscamos en el array la penultima posición donde esta el id

      console.log({ name, no });
    })
    return data.results;
  }
}
