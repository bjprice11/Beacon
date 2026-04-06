FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Beacon.API/Beacon.API.csproj Beacon.API/
RUN dotnet restore Beacon.API/Beacon.API.csproj

COPY Beacon.API/ Beacon.API/
RUN dotnet publish Beacon.API/Beacon.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Beacon.API.dll"]
