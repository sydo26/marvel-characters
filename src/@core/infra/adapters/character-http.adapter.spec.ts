import { CharacterHttpAdapter } from "./character-http.adapter";

import { Character } from "../../domain/entities/character";
import {
  mockMarvelHttpComicResponseOK,
  mockMarvelHttpListComicsResponseOK,
} from "@mocks/marvel-http-comics.mock";
import { Comic } from "@core/domain/entities/comic";
import {
  mockMarvelHttpCharacterResponseOK,
  mockMarvelHttpListCharactersResponseOK,
} from "@mocks/marvel-http-characters.mock";

const mockHttpClient = jest.fn();

const makeSut = (): CharacterHttpAdapter => {
  return new CharacterHttpAdapter(mockHttpClient());
};

beforeAll(() => {
  jest.resetModules();
  jest.resetAllMocks();
  mockHttpClient.mockClear();
});

describe("CharacterHttpAdapter", () => {
  it("should return a list of characters", async () => {
    // Quantos characters queremos no mock.
    const charactersCount = 2;
    const mockResult = mockMarvelHttpListCharactersResponseOK(charactersCount);

    mockHttpClient.mockReturnValueOnce({
      request: jest.fn().mockImplementation(() => Promise.resolve(mockResult)),
    });

    const sut = makeSut();

    const result = await sut.findAll({
      limit: 20,
      offset: 0,
      orderBy: "name",
    });

    // Checa se o resultado é diferente do mockResult
    expect(mockResult).not.toEqual(result);

    // Checa se o resultado é diferente de nulo
    expect(result).not.toBeNull();

    // Checa se nosso resultado é uma lista
    expect(Array.isArray(result?.characters)).toBe(true);

    // Checa se nossa lista é uma lista com o tipo Character.
    expect(result?.characters instanceof Array<Character>).toBe(true);

    // Checa se nossa lista tem o tamanho que queremos.
    expect(result?.characters?.length).toBe(2);

    // Checa se nossa lista tem o tamanho dos retornados
    expect(result?.characters?.length).toBe(result?.returned);

    // Checa se o primeiro elemento da lista é do tipo Character.
    expect(result?.characters[0] instanceof Character).toBe(true);

    const resultFirst = result?.characters[0] as Character;
    const mockCharacterFirst = mockResult.data.data.results[0] as any;

    // Checa se o primeiro elemento da lista tem os mesmos valores dos atributos de Character do nosso mock.
    expect(resultFirst.toJSON()).toMatchObject(
      new Character({
        id: mockCharacterFirst.id,
        description: mockCharacterFirst.description,
        name: mockCharacterFirst.name,
        modified: mockCharacterFirst.modified,
        thumbnail: mockCharacterFirst.thumbnail,
      }).toJSON()
    );
  });

  it("should return a list of comics by character id", async () => {
    const comicsCount = 2;
    const mockResult = mockMarvelHttpListComicsResponseOK(comicsCount);

    mockHttpClient.mockReturnValueOnce({
      request: jest.fn().mockImplementation(() => Promise.resolve(mockResult)),
    });

    const sut = makeSut();

    const result = await sut.findComicsById(1, {
      limit: 20,
      offset: 0,
      orderBy: "title",
    });

    // Checa se o resultado é diferente do mockResult
    expect(mockResult).not.toEqual(result);

    // Checa se o resultado é diferente de nulo
    expect(result).not.toBeNull();

    // Checa se nosso resultado é uma lista
    expect(Array.isArray(result?.comics)).toBe(true);

    // Checa se nossa lista é uma lista com o tipo Comic.
    expect(result?.comics instanceof Array<Comic>).toBe(true);

    // Checa se nossa lista tem o tamanho que queremos.
    expect(result?.comics?.length).toBe(comicsCount);

    // Checa se nossa lista tem o tamanho dos retornados
    expect(result?.comics?.length).toBe(result?.returned);

    // Checa se o primeiro elemento da lista é do tipo Comic.
    expect(result?.comics[0] instanceof Comic).toBe(true);

    const resultFirst = result?.comics[0] as Comic;
    const mockComicFirst = mockResult.data.data.results[0] as any;

    // Checa se o primeiro elemento da lista tem os mesmos valores dos atributos de Character do nosso mock.
    expect(resultFirst.toJSON()).toMatchObject(
      new Comic({
        id: mockComicFirst.id,
        description: mockComicFirst.description,
        title: mockComicFirst.title,
        modified: mockComicFirst.modified,
        thumbnail: mockComicFirst.thumbnail,
      }).toJSON()
    );
  });

  it("should return a character", async () => {
    const mockResult = mockMarvelHttpCharacterResponseOK();

    mockHttpClient.mockReturnValueOnce({
      request: jest.fn().mockImplementation(() => Promise.resolve(mockResult)),
    });

    const sut = makeSut();

    const result = await sut.findById(mockResult.data.data.results[0].id);

    // Checa se o resultado é diferente do mockResult
    expect(mockResult).not.toEqual(result);

    // Checa se o resultado é do tipo Character.
    expect(result instanceof Character).toBe(true);

    const mockCharacter = mockResult.data.data.results[0] as any;

    // Checa se o resultado tem os mesmos valores dos atributos de Character do nosso mock.
    expect(result.toJSON()).toMatchObject(
      new Character({
        id: mockCharacter.id,
        description: mockCharacter.description,
        name: mockCharacter.name,
        modified: mockCharacter.modified,
        thumbnail: mockCharacter.thumbnail,
      }).toJSON()
    );
  });

  it("should return an error when characters cannot be accessed", async () => {
    mockHttpClient.mockReturnValueOnce({
      request: jest.fn().mockImplementation(() => Promise.reject(new Error())),
    });

    const sut = makeSut();

    await expect(
      sut.findAll({
        limit: 20,
        offset: 0,
        orderBy: "name",
      })
    ).rejects.toThrow();
    await expect(sut.findById(1)).rejects.toThrow();
  });

  it("should return null when character cannot be found", async () => {
    const mockResult = mockMarvelHttpCharacterResponseOK();

    mockResult.data.data.results = [];

    mockHttpClient.mockReturnValueOnce({
      request: jest.fn().mockImplementation(() => Promise.resolve(mockResult)),
    });

    const sut = makeSut();

    const result = await sut.findById(0);

    expect(result).toBe(null);
  });

  it("should return an error when array of characters cannot be found in findById", async () => {
    const mockResult = mockMarvelHttpCharacterResponseOK();

    delete mockResult.data.data.results;

    mockHttpClient.mockReturnValueOnce({
      request: jest.fn().mockImplementation(() => Promise.resolve(mockResult)),
    });

    const sut = makeSut();

    await expect(sut.findById(0)).rejects.toThrow();
  });

  it("should return an error when array of characters cannot be found in findAll", async () => {
    const mockResult = mockMarvelHttpListCharactersResponseOK(2);

    delete mockResult.data.data.results;

    mockHttpClient.mockReturnValueOnce({
      request: jest.fn().mockImplementation(() => Promise.resolve(mockResult)),
    });

    const sut = makeSut();

    await expect(
      sut.findAll({
        limit: 20,
        offset: 0,
        orderBy: "name",
      })
    ).rejects.toThrow();
  });
});

export {};
