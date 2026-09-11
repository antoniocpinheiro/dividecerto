# DivideCerto Fácil V9

## Novidades da V9

- Ao renomear um gasto parcelado, por período, contínuo ou anual, o nome é sincronizado em toda a série/recorrência.
- Em parcelamentos e repetições por período, a edição de valor, pagador e categoria pode valer só para a ocorrência atual, para a atual e as próximas, ou para toda a série.
- Em gastos contínuos e anuais, o nome é global, mas valor/pagador/categoria continuam com o histórico preservado: somente a ocorrência atual ou atual e futuras.
- Trocar o tipo de um parcelamento/período exige selecionar “Toda a série”, evitando séries parcialmente convertidas e duplicidades.
- Mantém compatibilidade com os dados salvos pelas versões anteriores.

Versão com divisão sempre proporcional à renda, histórico mensal de rendas, gastos únicos, por período, parcelados, contínuos e recorrentes anuais.

## Novidades da V8

- **Recorrente anual**: ideal para IPVA, IPTU à vista, seguros e anuidades. Reaparece no mesmo mês dos anos seguintes.
- Ao editar um anual, escolha **somente esta ocorrência** ou **esta ocorrência e os próximos anos**, preservando anos anteriores.
- Ocorrências anuais futuras sem ajuste são identificadas como **valor previsto**.
- Campos de dinheiro aceitam valores brasileiros como `1.747,20`, `1747,20` e também `1747.20`. A visualização permanece formatada com ponto de milhar e vírgula decimal.
- Layout ampliado para monitores largos (até 1480 px de conteúdo).
- Visão Geral agora mostra o **desembolso efetivo** de cada pessoa por mês e no período. O cálculo é: gastos pagos pessoalmente + transferências feitas no acerto − valores recebidos no acerto.
- Os filtros do dashboard continuam afetando os gastos/gráficos do recorte; o desembolso efetivo usa o mês completo para representar o que realmente saiu do bolso.
- Dados das versões anteriores continuam compatíveis na mesma chave `dividecerto_easy_v1`.

## Teste local no Windows

Dê dois cliques em `INICIAR.bat` ou, dentro da pasta, execute:

```powershell
python -m http.server 8000
```

Abra `http://localhost:8000` e faça `Ctrl+F5` na primeira abertura da V9.


## Ajuste da V8 — saldo da conta conjunta

O saldo mensal da conta conjunta agora aceita valores positivos e negativos:

- saldo positivo: funciona como crédito e reduz o valor que o casal precisa dividir;
- saldo negativo: representa déficit/dívida da conta e aumenta o valor a dividir;
- o histórico continua mensal: alterar o saldo de um mês não altera os demais.

Exemplo: com R$ 16.093,90 de gastos e saldo conjunto de -R$ 101,00, o valor líquido a dividir é R$ 16.194,90.