[![en](https://img.shields.io/badge/lang-en-green.svg)](README.md)
[![pt-br](https://img.shields.io/badge/lang-pt--br-red.svg)](README.pt.md)

# Sobre o Projeto

Ticketz é um comunicador com recursos de CRM e helpdesk que utiliza o WhatsApp como meio de comunicação com clientes.

## Autoria Original

Este projeto foi iniciado em [um projeto Open Source](https://github.com/canove/whaticket-community), publicado pelo desenvolvedor [Cassio Santos](https://github.com/canove) sob a permissiva licença MIT. Posteriormente recebeu diversas melhorias de autores não identificados e foi distribuído comercialmente diretamente entre desenvolvedores e usuários com fornecimento do código-fonte. Segundo informações [deste vídeo, foi vazado e publicado publicamente em algum momento](https://www.youtube.com/watch?v=SX_cGD5RLkQ).

Após alguma pesquisa, identificou-se ainda que a primeira versão SaaS do Whaticket foi criada pelo desenvolvedor [Wender Teixeira](https://github.com/w3nder), incluindo uma versão [Whaticket Single](https://github.com/unkbot/whaticket-free) que usa a biblioteca Baileys para acesso ao WhatsApp.

É praticamente impossível identificar e creditar os autores das melhorias. [O código publicado pelo canal Vem Fazer](https://github.com/vemfazer/whaticket-versao-03-12-canal-vem-fazer) não menciona nenhuma licença; portanto, estou assumindo que todos os autores concordam em manter essas alterações sob a mesma licença do projeto original (MIT).

## Relicenciamento

Como estou realizando essas alterações e disponibilizando-as gratuitamente, desejo que elas estejam disponíveis para todos. Por isso, escolho relicenciar sob a AGPL, que exige que todo usuário que tenha acesso ao sistema possa obter o código-fonte.

Portanto, se você utilizar diretamente esta versão, é **muito importante manter o link na tela "Sobre o Ticketz", que dá acesso ao repositório**. Se desejar, você pode mover o link para o código-fonte para outro local, mas ele deve ser facilmente acessível a qualquer usuário do sistema.

Se você fizer alterações no código, deve alterar o link para um repositório ou outra forma de obter o código das suas alterações.

Se desejar usar partes do código para corrigir qualquer problema **para uso próprio**, fique à vontade e não precisa se preocupar com a licença AGPL. Entretanto, se quiser usar qualquer parte adicionada neste projeto em um sistema que você comercializa, deverá ou fornecer o código de todo o seu sistema para seus usuários, ou deverá entrar em contato com o autor do código para licenciá-lo sob critérios diferentes.

## Objetivo

O objetivo deste projeto é melhorar e manter abertas atualizações sobre o Whaticket SaaS publicado. Principalmente focado na qualidade da aplicação e facilidade de instalação e uso.

As melhorias desenvolvidas por mim serão colocadas aqui e, dependendo da situação, posso transpor, sempre creditando, códigos e melhorias publicadas em outros projetos também derivados do Whaticket Community ou Whaticket SaaS.

## Contribuindo de Volta

Sempre que possível, pretendo retornar alguns ajustes feitos aqui para os projetos originais.

Início Muito Rápido em um Servidor Público
-------------------------------------------

Existem imagens Docker fornecidas pelo projeto, para que você possa fazer o **ticketz** funcionar com muita facilidade em um servidor público (baremetal ou VPS).

### Primeira configuração

Antes de começar você deve completar esta lista de verificação:

- [ ] Ter um servidor limpo rodando Ubuntu 20 ou mais recente
- [ ] Portas 80 e 443 disponíveis e não filtradas por firewall
- [ ] Um hostname com DNS configurado apontando para seu servidor

Após isso, basta fazer login no seu servidor e executar o seguinte comando, substituindo os hostnames que você já configurou e seu endereço de e-mail:

```bash
curl -sSL get.ticke.tz | sudo bash -s app.example.com name@example.com
Após alguns minutos você terá o servidor rodando no hostname que definiu.

O login padrão será o endereço de e-mail fornecido no comando de instalação e a senha padrão é 123456, você deve alterá-la imediatamente.

Atualização
A atualização é tão fácil quanto a instalação, você só precisa fazer login no seu servidor usando o mesmo nome de usuário usado na instalação e executar o seguinte comando:

bash
curl -sSL update.ticke.tz | sudo bash
Seu servidor será desligado e após alguns minutos estará rodando na versão mais recente lançada.

Inspecionar logs
Como todos os elementos estão rodando em contêineres, os logs devem ser verificados através do comando docker.

Você deve fazer login no seu servidor usando o mesmo usuário que utilizou para a instalação.

Primeiro você precisa mover o diretório atual para a pasta de instalação:

bash
cd ~/ticketz-docker-acme
Após isso você pode obter um relatório completo de logs com o seguinte comando:

bash
docker compose logs -t
Se quiser "acompanhar" os logs em tempo real (tail follow), basta adicionar um parâmetro -f ao comando:

bash
docker compose logs -t -f
Executando a partir do Código Fonte Usando Docker

Para instalação, você precisa ter o Docker Community Edition e o cliente Git instalados. É ideal encontrar a melhor forma de instalar esses recursos no seu sistema operacional preferido. O guia oficial de instalação do Docker pode ser encontrado aqui.

Em ambos os casos, é necessário clonar o repositório, então abra um terminal de comando:

bash
git clone https://github.com/allgood/ticketz.git
cd ticketz
Executando Localmente
Por padrão, a configuração está definida para executar o sistema apenas no computador local. Para executá-lo em uma rede local, você precisa editar os arquivos .env-backend-local e .env-frontend-local e alterar os endereços de backend e frontend de localhost para o IP desejado, por exemplo, 192.168.0.10.

Para executar o sistema, basta executar o seguinte comando:

bash
docker compose -f docker-compose-local.yaml up -d
Na primeira execução, o sistema inicializará os bancos de dados e tabelas, e após alguns minutos, o Ticketz estará acessível pela porta 3000.

O nome de usuário padrão é admin@ticketz.host, e a senha padrão é 123456.

O aplicativo será reiniciado automaticamente após cada reinicialização do servidor.

A execução pode ser interrompida com o comando:

bash
docker compose -f docker-compose-local.yaml down
Executando e Servindo na Internet
Tendo um servidor acessível via internet, é necessário ajustar dois nomes DNS de sua escolha, um para o backend e outro para o frontend, e também um endereço de e-mail para registro do certificado, por exemplo:

backend: api.ticketz.example.com

frontend: ticketz.example.com

email: ticketz@example.com

Você precisa editar os arquivos .env-backend-acme e .env-frontend-acme, definindo esses valores neles.

Se quiser usar reCAPTCHA no cadastro de empresas, você também precisa inserir as chaves secretas e do site nos arquivos de backend e frontend, respectivamente.

Este guia pressupõe que o terminal está aberto e logado com um usuário normal que tem permissão para usar o comando sudo para executar comandos como root.

Estando na pasta raiz do projeto, execute o seguinte comando para iniciar o serviço:

bash
sudo docker compose -f docker-compose-acme.yaml up -d
Na primeira execução, o Docker compilará o código e criará os contêineres, e então o Ticketz inicializará os bancos de dados e tabelas. Esta operação pode levar bastante tempo, após o qual o Ticketz estará acessível no endereço de frontend fornecido.

O nome de usuário padrão é o endereço de e-mail fornecido no arquivo .env-backend-acme e a senha padrão é 123456.

O aplicativo será reiniciado automaticamente após cada reinicialização do servidor.

Para encerrar o serviço, use o seguinte comando:

bash
sudo docker compose -f docker-compose-acme.yaml down
Aviso Importante

Este projeto não é afiliado à Meta, WhatsApp ou qualquer outra empresa. O uso do código fornecido é de responsabilidade exclusiva dos usuários e não implica qualquer responsabilidade para o autor ou colaboradores do projeto.
