# Loja Modelo 🛍

Loja virtual **grátis**: vitrine, página de produto, carrinho, frete e pedido finalizado pelo **WhatsApp** (ou link de pagamento online por produto).
Hospedagem grátis no GitHub Pages. Sem mensalidade, sem servidor.

**Ver funcionando:** https://emillydesign.github.io/loja-modelo

## Criar uma loja nova (para você ou para um cliente)
1. Clique em **Use this template → Create a new repository**. Dê o nome da loja (ex.: `loja-maria`) e deixe **Public**.
2. No repositório novo: **Settings → Pages → Branch: main / root → Save**. Em 1 minuto a loja está em `https://SEU-USUARIO.github.io/loja-maria`.
3. Edite **`loja.json`** (nome, cores, WhatsApp, frete, textos) e **`produtos.json`** (produtos).
4. Fotos: suba na pasta `img/` (**Add file → Upload files**) e use o caminho no produto, ex.: `"imagem": "img/vestido-azul.jpg"`.

## Arquivos
| Arquivo | Para quê |
|---|---|
| `loja.json` | nome, slogan, WhatsApp (com 55 + DDD), cores, fontes, banner, frete, formas de pagamento |
| `produtos.json` | lista de produtos: nome, preço, preço antigo, foto, categoria, descrição, variações, link de pagamento, disponível |
| `css/loja.css` | o visual (mude com a ajuda do Claude) |
| `js/loja.js` | o funcionamento (não precisa mexer) |

## Pagamento online (opcional)
Crie um **link de pagamento** para o produto no Mercado Pago, InfinitePay, PagBank ou Stripe (todos sem mensalidade, cobram taxa por venda) e cole em `"linkPagamento"`. Aparece o botão "Comprar agora".

## Editando com o Claude grátis
Abra o arquivo no GitHub → copie o conteúdo → cole no claude.ai com um destes pedidos → copie a resposta → no GitHub clique no lápis ✏️, cole e **Commit changes**.

```
Este é o loja.json da minha loja. Troque o nome para "Doce Maria", slogan "Bolos caseiros por encomenda",
WhatsApp 5511988887777, cores em tons de rosa claro com destaque marrom chocolate, e o banner
falando de bolos de festa. Me devolva o arquivo completo.
```
```
Este é o produtos.json. Substitua pelos produtos abaixo, mantendo o mesmo formato
(id sem espaços, preço com ponto): [cole sua lista]
```
```
Este é o css/loja.css. Quero um visual mais sofisticado: cantos menos arredondados, títulos em serifa
(Playfair Display), cards sem sombra com borda fina. Me devolva o arquivo completo.
```
Dica: para várias mudanças de uma vez no navegador, aperte a tecla **.** (ponto) no repositório para abrir o editor **github.dev**.
