    //TODO: Na opcao do protoloco SAC/COTACAO, ao carregar um CTe, verificar antes se o CTe já esta sendo acompanhando ou nao

    //TODO: quando a expedicao dar saida, já salva o horario em um BD
    //TODO: opcao 114, colocar um link para quem ja fez cotacao
    //TODO: Em qualquer opcao, sempre colocar a data quando salvar no BD
    //TODO: na 102, opcao de limpar o cnpj com pontos e tracos
    var permissao;
    // aguarda antes de carregar o plugin para dar tempo do SSW construir a tela
    var node;
    var socket

    erenilda();

    if(getCookie('agente')==""){}else{
        socket = io("https://nodeservercvl.azurewebsites.net");
        socket.on("connect", () => {
            console.log(socket.id); // "G5p5..."
            socket.emit('conectar_ssw',getCookie('login'))
        });
    }
    //const socket = io.connect("http://localhost:3000");
    /*
    xmlhttp = new XMLHttpRequest();
    xmlhttp.withCredentials = false;
                        xmlhttp.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200) {

                                myObj = this.responseText;
                                console.log('Aqui está:' + myObj)
                            }
                        };
                        usuario = 
                        xmlhttp.open("GET", "https://nodeservercvl.azurewebsites.net/op=user_callcenter&usuario="+usuario, true);
                        xmlhttp.send();
    */



    /*
    socket.on('agente', (data) => {
        console.log("Agente: "+data.agente +"\nTelefone: ("+ data.ddd+')'+data.telefone)
        if(data.agente==agente){
            callcenter(data.ddd,data.telefone)
        }
    });
    */
    //console.log("antes do timeout")
    intervalo = 0;
    setInterval(() => { //letreiro vermelho no site da consulta ANTT
        if (intervalo == 0) {
            if (window.location.href == "https://consultapublica.antt.gov.br/Site/ConsultaRNTRC.aspx") {
                todosSpans = document.getElementsByTagName('span');
                for (i = 0; i < todosSpans.length; i++) {
                    if (todosSpans[i].innerHTML == "Este transportador se enquadra na situação prevista no artigo 5-A, da Lei 11.442/2007. Portanto, deverá ser remunerado por meio do Pagamento Eletrônico de Frete, conforme disposições da Resolução ANTT nº 3658/2011.") {
                        novoAlerta = document.createElement('span');
                        novoAlerta.setAttribute('style', 'color:red;font-family:arial;font-size:18px;')
                        novoAlerta.innerHTML = ' - <big>Necessita de CIOT</big>'
                        document.querySelector('h6').append(novoAlerta)
                        intervalo = 1;
                    }
                }
            }
        }
    }, 900);



    setTimeout(function() {
        //console.log("dentro do timeout")  
        //const socket = io('http://localhost:3000');
        //socket = io.connect("https://nodeservercvl.azurewebsites.net");
        var tela, grupo, juncao;
        if (document.getElementById("telaprog")) {
            tela = document.getElementById("telaprog").textContent.substring(0, 10).trim();
            grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
            juncao = grupo + tela;
            console.log('Tela: ' + tela + ' Grupo: ' + grupo);
            qualquer = getCookie('ssw_dom');
            console.log(qualquer)
            chrome.storage.local.set({
                'logadoChat': false
            });
            if (grupo.trim() == "") {

                //tela antes do login nao tem grupo
                chrome.storage.local.set({
                    'primeira_execucao': true
                }, function() {
                    console.log('No login, zera a primeira vez para atualizar politica de permissao')
                    });

                if (getCookie('dom_empresa') == "OTC") {
                    //dummy=performance.now()
                    document.body.style.background = 'url("https://www.carvalima.com.br/uploads/marketing/images/marketing.png) no-repeat';
                    document.body.style.backgroundPositionY = '45px';
                }

                //falta implementar
                //TODO: verificar se o usuario tem ou nao a extensao
                data = new Date();
                data = data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear();

                setCookie("extensao", data, 1)


            } else {
                //depois do login
                chrome.storage.local.get(['primeira_execucao'], function(result) {
                    dominio = document.getElementsByClassName("texto3")[0].innerText.substring(8, document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
                    //dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim();
                    setCookie('dom_empresa', 'true');

                    //console.log('Primeira Execucao? R: ' + result.primeira_execucao);
                    if (result.primeira_execucao == true || result.primeira_execucao == undefined) {
                        //console.log('Primeira Execucao: '  + true );
                        xmlhttp = new XMLHttpRequest();
                        xmlhttp.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200) {

                                myObj = this.responseText;
                                permissao = myObj.split(',');
                                //console.log('Grupo: '+grupo);
                                //console.log('permissao(rdystate): '+permissao)

                                chrome.storage.local.set({
                                    'primeira_execucao': false
                                }, function() {
                                    //console.log('Setando que para falso(nao eh mais a primeira vez) a primeira executaca apos requisitar no BD as opcoes liberadas dos usuarios')
                                });
                                chrome.storage.local.set({
                                    'permissao': permissao.toString()
                                }, function() {
                                    //console.log('Salvanado as permissoes localmente para nao ter que ficar requisitando no BD toda hora')
                                });
                                setCookie('permissao', permissao.toString())
                            }
                        };
                        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=acesso&f1=read&f2=" + grupo, true);
                        xmlhttp.send();

                    } else {    
                        console.log('Nao é primeira vez');
                    }
                });

            }

        } else {
            tela = "";
        }

        //todo consideraar somente ate o "." //ssw1601.03 -> ssw1601
        //console.log(tela)
        switch (tela) {
            
            case "ssw0183.05":
                op457();
                erenilda();
                break;
            case "ssw0126.05":
                anulacoes_substituicoes();  //TABELA COM SOLICITAÇÕES DE SUBSTITUIÇÃO/ANULAÇÃO NA OP 48
                break;
            case "ssw0091.01":
                marca_dagua();
                break;
            case "ssw0020.02":
                marca_dagua();
                break;
            case "ssw0020.07":
                marca_dagua(); //adiciona marca dágua no fundo da tela
                break;
            case "ssw0021.10":
                marca_dagua();
                break;
            case "ssw0091.11":
                marca_dagua();
                break;
            case "ssw0173.28":
                marca_dagua();
                break;
            case "ssw0019.17":
                marca_dagua();
                break;
            case "ssw0219.08":
                marca_dagua();
                break;
            case "ssw0019.02":
                marca_dagua();
                break;
            case "ssw0043.03":
                marca_dagua();
                break;
            case "ssw0043.02":
                marca_dagua();
                break;
            case "ssw0219.01":
                op483(); //limpa ctrl+v de cnpjs
                break;
            case "ssw0166.03":
                op103_acompanhar();
            case "ssw0017.01":
                op001_cnpj(); //retira barras e traços dos cnpjs copiados OP 001
                op001_acompanhar(); //botão de 'acompanhar coleta'
                break;
            case "ssw1601.03": //opc002
                mediakg_cotacao(); //dentro da cotacao
                cotacao(); //tela cotacao nao fechada
                op002(); //novos campos da op002
                op002_simular();
                break;
            case "ssw1601.08": //opc002
                mediakg_cotacao(); //dentro da cotacao
                cotacao(); //tela cotacao nao fechada
                op002(); //novos campos da op002
                break;
            case "ssw0053.01": //opcao 101 
                op101_1(); //acompanhamento e SAC
                op101_cte(); //corrige ctrl+v do campo CTe
                descontos_aprovados();
                //op101_2_sac('opc101_1');//protocolo sac 
                break;
            case "menu01.03": //tela inicial
                idagent();
                inicio(); //cnfiguracoes
                op001_1(); //checa cotacoes redespacho
                //chat();
                break;
            case "ssw0053.35": //opc101_2
                gatilho_ocorrencia();
                op101_2_geral(); //opcao 101 dentro do CTe      
                op101_2_retira(); //cliente retira na opc101_2
                op101_2_sac('opc101_2'); //adiciona SAC na opc101_2
                descontos(); //solicitação de descontos
                marca_dagua();
                break;
            case "ssw0024.02":
                expedicao(); //nao implementado
                declaracao();
                break;
            case "ssw0122.07":
                indenizacao();
                gatilho_motivo();
                op101_2_sac('opc101_3'); //adiciona SAC na opc101 dentro de ocorrencia  
                op101_2_pi();
                op101_justificativa();
                op101_ocorrencias();
                break;
            case "ssw0054.19": //opcao 102
                op101_2_sac('opc102');
                op102(); //exibe últimos 20 CNPJs consultados do lado direito + altera o ctrl+v no campo cnpj
                op102_analises(); //mostra para o financeiro (43) os pedidos de análise de crédito recentes
                break;
            case "ssw0602.01":
                op88();
                break;
            case "ssw0018.10": //opção 003
                op003(); //alterar data da coleta, justificar com "motivo" no cancelamento de coleta
                break;
            case "ssw0178.01":
                op030(); //desabilita links ("imprimir", "nota fiscal") para todos do grupo 22
                break;
            case "ssw1243.01": //opção 139
                op139(); //nova busca por usuários, que retorna mais dados do mesmo
                break;
            case "ssw0054.23": //Análise de Crédito, op 102
                op102_analise();
                cadastro_tabela();
                marca_dagua();
                break;
            case "ssw0840.02":
                op102_analise(); //Análise de Crédito, mas para o financeiro
                break;
            case "ssw1601.01":
                op002_andamento(); //Exibe cotações em acompanhamento escolhidas pelo usuário na 002 + altera o ctrl+v do campo cnpj
                break;
            case "ssw0166.07":
                op103_cnpj(); //altera o ctrl+v dos campos de cnpj
                op103_tabela(); //exibe tabela com coletas em acompanhamento
                break;
            case "ssw0183.26": //op457
                op457_relatorio();
                op457_cnpj(); //altera o ctrl+v dos campos de cnpj
                op457_cookie(); //complemento da descontos_faturas, abaixo
                break;
            case "ssw0183.32":
                descontos_faturas(); //solicitação de descontos para faturas (op457)
                break;
            case "ssw0094.36":
                op475_antecipar_pagamento();
                break;
        }
    }, 1200);
        criaDiv();
    /*  
        socket.on('agente', (data) => {
            console.log("Agente: "+data.agente +"\nTelefone: ("+ data.ddd+')'+data.telefone)
            try{
                var result = agente.find(t=>t.idagent == data.agente).usuario
                if(getCookie('login')==result){
                    
                    callcenter(data.ddd,data.telefone)
                }
            }catch(err){
        
            }
            
        });
    */
        if(getCookie('agente')==""){}else{
            socket.on('agente', (data) => {
                console.log("Agente: "+data.agente +"\nTelefone: ("+ data.ddd+')'+data.telefone)
                try{
                    //var result = agente.find(t=>t.idagent == data.agente).usuario
                    if(getCookie('agente')==data.agente){
                        callcenter(data.ddd,data.telefone)
                    }
                }catch(err){

                }
                
            });
        }

        function idagent(){
            if(getCookie('agente')==''){
                usuario = getCookie('login');
                xmlhttp = new XMLHttpRequest(); //PEGA O IDAGENT DO USUÁRIO (callcenter)
                xmlhttp.onreadystatechange = function() {
            
                    if (this.readyState == 4 && this.status == 200) {
                        myObj = this.responseText;
                        console.log(myObj)
                        x = JSON.parse(myObj);
                        console.log(x.length);
            
                        for (var i = 0; i < x.length; i++) {
                            agente = x[i].idagent;
                            setCookie('agente', agente, 1);
                        }

                    }
                }
                xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=user_callcenter&usuario=" + usuario, true);
                xmlhttp.send();
            }
        }

        function indenizacao(){
    /*        usuario = getCookie('login');
            if(usuario=='artur'){
                indenizacao = document.createElement('span');
                indenizacao.innerText = 'Indenização';
                indenizacao.setAttribute('id', 'indenizacao');
                indenizacao.setAttribute('style', 'position:absolute;top:270px;left:700px;font-size:10px;font-family:verdana;color:blue');
                document.body.append(indenizacao);

                document.getElementById('indenizacao').addEventListener('click', ()=>{
                    //formulário de indenização
                    tipo
                    codigo ocorrencia
                    data da ocorrencia
                    ctrc
                    nota fiscal
                    qtd total volume
                    remetente
                    destinatario 
                    cidade e estado do destinatario
                    motorista
                    placa veiculo
                    ocorrência
                    ..................
                    aguardando aprovação -> aprovar 
                    indenizar cliente
                    ________________________________________
                    filia origem
                    filial destino
                    ctrc reposição

                })

            }*/
        }

        function anulacoes_substituicoes(){

            usuario = getCookie('login');
            grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
            if(usuario == 'jheniffe' || usuario =='lidiane' || usuario=='otavio' || usuario=='erenilda' || usuario=='artur' || grupo=='43' || grupo=='12'){
                node = document.createElement("table");
                node.setAttribute("id", "tabela");
                node.setAttribute("class", "srdiv");
                node.setAttribute("style", "table-layout: fixed;");
                document.body.append(node);
                date = new Date();
                hoje = date.getDate() + "/" + (date.getMonth()+1)
                
               titulo = document.createElement('h3');
                titulo.setAttribute('id', 'titulo');
                titulo.innerText = 'Solicitações em aberto:'
                titulo.setAttribute('style', 'position:absolute;top:400px;font-family:verdana;left:40px;');
                document.body.append(titulo);
      
                tabela3 = document.createElement('table');
                tabela3.setAttribute('id', 'tabela3')
                tabela3.setAttribute('style', 'position:absolute;top:450px;left:40px;')
                document.body.append(tabela3)            
      
                xmlhttp = new XMLHttpRequest(); //EXIBE TABELA COM DESCONTOS APROVADOS
                xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    estilo = ' style="cursor: pointer; background: rgb(255, 255, 255); position: relative; text-decoration: none;" ';
                    myObj = this.responseText;
                    x = JSON.parse(myObj);
                    console.log(x)
                    html = '';
                    html += '<tr class="srtr2" style="cursor: default;">';
                    html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">CNPJ</a></div></td>';
                    html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Cliente</a></div></td>';
                    html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">CTRC Fatura</a></div></td>';
                    html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Tipo de Solicitação</a></div></td>';
                    html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Motivo</a></div></td>';
                    html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Detalhe</a></div></td>';
                    html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Usuário Solicitante</a></div></td>';
                    html += '</tr>';
                    totalNum = x.length;
        
                    for (var i = 0; i < x.length; i++) {
                        html += '<tr class="srtr2" id="linha' + i + '">';
                        html += '<td class="srtd2"><div class="srdvl" id="' + x[i].cnpj + '">' + x[i].cnpj + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="' + x[i].cnpj + '">' + x[i].nome_cliente + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="' + x[i].cnpj + '">' + x[i].ctrc_fatura + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="' + x[i].cnpj + '">' + x[i].tipo + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="' + x[i].cnpj + '">' + x[i].motivo + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="' + x[i].cnpj + '">' + x[i].detalhe + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="' + x[i].cnpj + '">' + x[i].usuario + '</div></td>';
                    }
                    html += '</tr>';
                    document.getElementById('tabela3').innerHTML = html;
                }
            }
            xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=anulacoes_substituicoes&hoje" + hoje, true);
            xmlhttp.responseType="text";
            xmlhttp.send();            
        }
      
        var table3 = document.getElementById('tabela3');
                table3.addEventListener('click', function(e) {
                    if (e.target.nodeName.toUpperCase() == "DIV") {
                        if (e.target.id) {
                            setCookie('ocorrencia', true, 1);
                            document.getElementById("20").value = e.target.getAttribute('id');
                            document.getElementById('21').click();
                            myobj = {
                                cnpj: e.target.getAttribute('id')
                            }
                            salva_bd(myobj, 'liquida');
                        }
                    }
                    return;
                });         
    }


        function gatilho_motivo(){
            if(getCookie('motivo_completa')){
                document.getElementById('nokey').value = getCookie('motivo_completa');
                setCookie('motivo_completa', '', -2);
            }
        }
      
        function gatilho_ocorrencia(){
            if(getCookie('ocorrencia')){
                document.getElementById('link_ocor').click();
            }
            setCookie('ocorrencia', true, -2);
            
            xmlhttp = new XMLHttpRequest(); //consulta a tabela "descontos" para exibir o info/formulario condizente
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    myObj = this.responseText;
                    x = JSON.parse(myObj);
                    if (x.length > 0) {
                        setCookie('motivo_completa', x[0].motivo, 1);
                    }
                }
            }
                ctrcfatura = document.getElementsByClassName('data')[2].innerText
                xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=desconto&descontoacao=exibe&ctrcfatura=" + ctrcfatura, true);
                xmlhttp.send();
            
        }

        function op457_relatorio(){
            usuario = getCookie('login');
            grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
            if(usuario=='jheniffe' || usuario == 'otavio' || grupo == '43' || grupo == '18' || usuario == 'artur'){
                link_relatorio = document.createElement('a');
                link_relatorio.setAttribute('id', 'link_relatorio');
                link_relatorio.setAttribute('href', 'http://sswresponse.azurewebsites.net/relatorio.php?auth=faturas');
                link_relatorio.innerText = 'Relatório das Faturas'
                link_relatorio.setAttribute('style', 'position:absolute;top:450px;left:44px;color:navy;font-size:12px;font-family:verdana;');
                document.querySelector('body').append(link_relatorio);
            }
        }

        function descontos_aprovados(){
            const data = new Date();
            hoje = data.getDate() + "/" + (data.getMonth()+1)

            usuario = getCookie('login');
            grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);

            if(usuario == 'jheniffe' || usuario =='lidiane' || usuario=='erenilda' || grupo=='43' || grupo=='56' || usuario == 'artur'){
                node = document.createElement("table");
               node.setAttribute("id", "tabela");
                node.setAttribute("class", "srdiv");
                node.setAttribute("style", "table-layout: fixed;");
                document.body.append(node);
            
                titulo = document.createElement('h3');
                titulo.setAttribute('id', 'titulo');
                titulo.innerText = 'Descontos Aprovados'
                titulo.setAttribute('style', 'font-family:verdana;');
                document.querySelector('#divTabela').append(titulo);

                tabela3 = document.createElement('table');
                tabela3.setAttribute('id', 'tabela3')
                tabela3.setAttribute('style', 'margin-top:10px;')
                document.querySelector('#divTabela').append(tabela3)
            
            /*
            var date = new Date();
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var hoje = day+month;
            */
            
                xmlhttp = new XMLHttpRequest(); //EXIBE TABELA COM DESCONTOS APROVADOS
                xmlhttp.onreadystatechange = function() {
        
                    if (this.readyState == 4 && this.status == 200) {

                        estilo = ' style="cursor: pointer; background: rgb(255, 255, 255); position: relative; text-decoration: none;" ';
                        myObj = this.responseText;
                        x = JSON.parse(myObj);
                        console.log(x)
                        html = '';
                        html += '<tr class="srtr2" style="cursor: default;">';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">CTe</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Cliente</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Usuario</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Motivo</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Detalhe</a></div></td>';
                        html += '</tr>';
                        totalNum = x.length;
        
                        for (var i = 0; i < x.length; i++) {
                            html += '<tr class="srtr2" id="linha' + i + '">';
                            html += '<td class="srtd2"><div class="srdvl" id="' + x[i].ctrc + '">' + x[i].ctrc + '</div></td>';
                            html += '<td class="srtd2"><div class="srdvl" id="' + x[i].ctrc + '">' + x[i].nome_cliente + '</div></td>';
                            html += '<td class="srtd2"><div class="srdvl" id="' + x[i].ctrc + '">' + x[i].usuario_confirmante + '</div></td>';
                            html += '<td class="srtd2"><div class="srdvl" id="' + x[i].ctrc + '">' + x[i].motivo + '</div></td>';
                            html += '<td class="srtd2"><div class="srdvl" id="' + x[i].ctrc + '">' + x[i].detalhe + '</div></td>';
                        }
                        html += '</tr>';
                        document.getElementById('tabela3').innerHTML = html;
                    }
                }
                xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=descontos_aprovados&?hoje=" + hoje, true);
                xmlhttp.responseType="text";
                xmlhttp.send();
                var table3 = document.getElementById('tabela3');
                table3.addEventListener('click', function(e) {
                    if (e.target.nodeName.toUpperCase() == "DIV") {
                        if (e.target.id) {
                            setCookie('ocorrencia', true, 1);
                            document.getElementById("t_ser_ctrc").value = e.target.getAttribute('id').substring(0, 3);
                            document.getElementById("t_nro_ctrc").value = e.target.getAttribute('id').substring(3, 9);
                            document.getElementById('2').click();
                        }
                    }
                    return;
                });            
            }
        }

        function op002_simular(){
            /*
                usuario = getCookie('login');
                id = 

                function post_request(){
                var http = new XMLHttpRequest();
                http.open('POST', 'https://app.pipe.run/webservice/integradorJson?hash=88ebdfd0-62e0-49a3-95f8-a6d8b5c14077', true);
                http.onreadystatechange = function() {
                    if(http.readyState == 4 && http.status == 200) {
                        console.log(http.responseText);
                    }
                }

                http.setRequestHeader('Content-Type', 'application/json');
                http.send(JSON.stringify({
    
                    "leads": [{
                        "user": usuario,
                        "id": "pessoa_email2@email.com",
                        "title": "Teste OP via Json",
                        "name": "Pessoa 123",
                        "email": "pessoa_email@email.com",
                        "cpf": "0123456789",
                        "personal_phone": "(51) 33333333",
                        "mobile_phone": "(51) 999999999",
                        "company": "Empresa 456",
                        "cnpj": "9876543210",
                        "city_name": "Porto Alegre",
                        "city_state": "RS",
                        "last_conversion": {
                            "source": "Formulário Site"
                        },
                        "custom_fields": {
                            "Campo customizado teste 1": "Sim",
                            "Campo customizado teste 2": "(51) 123456789"
                        },
                        "tags": [
                            "formSite"
                        ],
                        "notes": [
                            "Lead obtido através da integração com o formulário XYZ do site ABC."
                        ]
                    }]
                }));
            }
            

            document.getElementById('134').addEventListener('click', ()=>{
                post_request();
            });
            document.getElementById('137').addEventListener('click', ()=>{
                post_request();
            });
            document.getElementById('140').addEventListener('click', ()=>{
                post_request();
            });*/
        }

        function op101_ocorrencias(){
            document.getElementById('9').addEventListener('click', ()=>{
                usuario = getCookie('login');
                cte = document.getElementById('1').innerText;
                codigo = document.getElementById('3').value;
                data = document.getElementById('4').value;
                hora = document.getElementById('5').value;
                ocorrencia = document.getElementById('6').value;

                obj = {
                    usuario:usuario,
                    cte:cte,
                    codigo:codigo,
                    data:data,
                    hora:hora,
                    ocorrencia:ocorrencia
                }
                salva_bd(obj, '101_ocorrencia');
            });

            document.getElementById('7').addEventListener('click', ()=>{
                setTimeout(function(){
                    document.getElementById('17').addEventListener('click', ()=>{
                        usuario = getCookie('login');
                        cte = document.getElementById('1').innerText;
                        codigo = document.getElementById('3').value;
                        data = document.getElementById('4').value;
                        hora = document.getElementById('5').value;
                        ocorrencia = document.getElementById('6').value;
                        ocorrencia += document.getElementById('detalhe').value;
            
                        obj = {
                            usuario:usuario,
                            cte:cte,
                            codigo:codigo,
                            data:data,
                            hora:hora,
                            ocorrencia:ocorrencia
                        }
                        salva_bd(obj, '101_ocorrencia');
                    })
                }, 2000)
            })
        }


        function op475_antecipar_pagamento(){
            antecipar_pagamento = document.createElement('a');
            antecipar_pagamento.setAttribute('style', 'position:absolute;left:900px;top:418px;color:blue;text-decoration:none;');
            antecipar_pagamento.setAttribute('href', '#');
            antecipar_pagamento.innerText = 'Antecipar Pagamento';
            antecipar_pagamento.setAttribute('id', 'antecipar_pagamento');
            document.body.append(antecipar_pagamento);
            document.getElementById('antecipar_pagamento').addEventListener('click', ()=>{

                data_vencimento = document.getElementById('34').value;
                data_pagamento = document.getElementById('35').value;
                valor_documento = document.getElementById('15').value;
                valor_final_da_parcela = document.getElementById('vlr_final').value;
                desconto_da_parcela = document.getElementById('39').value;
                nro_lancamento = document.getElementById('nro_lancto').value;
                unidade = document.getElementById('filial_sigla').value;
                codigo = document.getElementById('codigo').value;
                cnpj_fornecedor = document.getElementById('2').value;
                nome = document.getElementById('3').innerText;
                usuario = getCookie('login');


                obj = {
                    cnpj_fornecedor:cnpj_fornecedor,
                    nome:nome,
                    usuario:usuario,
                    numero_lancamento:nro_lancamento,
                    unidade:unidade,
                    evento:codigo,
                    data_vencimento:data_vencimento,
                    data_pagamento:data_pagamento,
                    valor_documento:valor_documento,
                    valor_final:valor_final_da_parcela,
                    desconto_parcela:desconto_da_parcela
                }
                salva_bd(obj, 'antecipar_pagamento');
                alert('Antecipação de pagamento registrada.');
                document.getElementById('antecipar_pagamento').style.visibility = 'hidden';

            });

            document.getElementById('antecipar_pagamento').addEventListener('mouseover', ()=>{
                document.getElementById('antecipar_pagamento').style.color = 'red';
            })
            document.getElementById('antecipar_pagamento').addEventListener('mouseout', ()=>{
                document.getElementById('antecipar_pagamento').style.color = 'blue';
            })
            
        }
    
        /*
        chrome.storage.local.get(['agente'], function(result) {
            console.log('recuperando o agente: ' +result.agente);
            agente = result.agente
            if(result.agente==null){
            console.log('agente nulo');
            agente = prompt("Qual o seu ID do agente CALLCENTER. Se não tiver, só dar o OK", "1111");
            if (agente == null || agente == ""  ) {
                agente = '';
            } 
            console.log('agente'+agente);
            chrome.storage.local.set({'agente': agente});
            }else{
                agente = result.agente
                console.log('recuperando o agente2: ' +result.agente);
            }
            document.getElementById('agente').innerText="Agente: "+agente+" - Clique para mudar";
        });
        
        criaDiv();
        */
    
    

    function op101_justificativa(){

        novocampo11 = document.createElement('div');
        novocampo11.innerText = 'Motivo:';
        novocampo11.setAttribute('id', 'novocampo11');
        novocampo11.setAttribute('style', 'font-family:verdana;font-size:10px;position:absolute;left:360px;top:344px;visibility:hidden')
        document.body.append(novocampo11);
        
        novocampo22 = document.createElement('div');
        novocampo22.innerText = 'Responsabilidade:';
        novocampo22.setAttribute('id', 'novocampo22');
        novocampo22.setAttribute('style', 'font-family:verdana;font-size:10px;position:absolute;left:360px;top:362px;visibility:hidden;')
        document.body.append(novocampo22);

        novocampo33 = document.createElement('div');
        novocampo33.innerText = 'Observação:';
        novocampo33.setAttribute('id', 'novocampo33');
        novocampo33.setAttribute('style', 'font-family:verdana;font-size:10px;color:black;position:absolute;left:360px;top:380px;visibility:hidden;');
        document.body.append(novocampo33);
        

        novocampo1 = document.createElement('select');
        novocampo1.setAttribute('id', 'novocampo1');
        novocampo1.setAttribute('placeholder', 'Selecione o motivo:')
        novocampo1.setAttribute('style', 'top:344px;font-family:verdana;font-size:10px;left:480px;position:absolute;visibility:hidden;');
        document.body.append(novocampo1);

        opcao = document.createElement('option');
        opcao.text = '';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'FALHA OPERACIONAL';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'AGENDADA PELO CLIENTE';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'ATRASO NA TRANSFERÊNCIA EMBARCADORA';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'CLIENTE SOLICITOU RETIRADA';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'ATRASO NA SAÍDA/CHEGADA/DESCARGA';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'FERIADO';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'ATRASO PENDÊNCIAS';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'FALTA PASSAGEM FISCAL';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'TROCA UNIDADE SOL CLIENTE';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'DATA DO COMPROVANTE';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'CLIENTE EM BALANÇO';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'CLIENTE SEM EQUIPAMENTO PARA RECEBIMENTO';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'CLIENTE AUSENTE';
        document.getElementById('novocampo1').appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'CLIENTE FECHADO';
        document.getElementById('novocampo1').appendChild(opcao);

        novocampo2 = document.createElement('select');
        novocampo2.setAttribute('type', 'text');
        novocampo2.setAttribute('id', 'novocampo2');
        novocampo2.setAttribute('style', 'top:362px;left:480px;width:44ch;position:absolute;visibility:hidden;font-family:verdana;font-size:10px');
        novocampo2.setAttribute('placeholder', '(responsabilidade)');
        document.body.append(novocampo2);
        opcao = document.createElement('option');
        opcao.text = '';
        novocampo2.appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'Cliente Remetente';
        novocampo2.appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'Cliente Destino';
        novocampo2.appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'Transportador';
        novocampo2.appendChild(opcao);
        
        
        
        
        novocampo3 = document.createElement('input');
        novocampo3.setAttribute('id', 'novocampo3');
        novocampo3.setAttribute('type', 'text');
        novocampo3.setAttribute('placeholder', 'Observação');
        novocampo3.setAttribute('style', 'top:380px;visibility:hidden;color:black;left:480px;width:44ch;font-family:verdana;position:absolute;font-size:10px;');
        document.body.append(novocampo3);

        justificativa = document.createElement('a');
        justificativa.setAttribute('style', 'font-family:verdana;text-decoration:underline;font-size:10px;top:368px;left:700px;position:absolute;color:blue;');
        justificativa.setAttribute('href', '#')
        justificativa.setAttribute('id', 'justificativa');
        justificativa.innerText = 'Justificativa';
        document.body.append(justificativa);

        document.getElementById('justificativa').addEventListener('mouseover', ()=>{
            document.getElementById('justificativa').style.color = 'red';
        })
        document.getElementById('justificativa').addEventListener('mouseout', ()=>{
            document.getElementById('justificativa').style.color = 'blue';
        })
        document.getElementById('justificativa').addEventListener('click', ()=>{

            document.getElementById('novocampo11').style.visibility = 'visible';
            document.getElementById('novocampo22').style.visibility = 'visible';
            document.getElementById('novocampo33').style.visibility = 'visible';
            document.getElementById('justificativa').style.visibility = 'hidden';
            document.getElementById('novocampo1').style.visibility = 'visible';
            document.getElementById('novocampo2').style.visibility = 'visible';
            document.getElementById('novocampo3').style.visibility = 'visible';
        })

        document.getElementById('12').addEventListener('click', ()=>{
            campo_motivo = document.getElementById('novocampo1').value;
            campo_responsabilidade = document.getElementById('novocampo2').value;
            campo_observacao = document.getElementById('novocampo3').value
            cte = document.getElementById('1').innerText;
            nome_cliente = document.getElementsByClassName('data')[6].innerText;
            usuario = getCookie('login');
            instrucaossw = document.getElementById('nokey').value;
            notafiscal = document.getElementsByClassName('data')[2].textContent;
            cliente_remetente = document.getElementsByClassName('data')[6].innerText;
            cliente_destino = document.getElementsByClassName('data')[7].innerText;
            cidade_destino = document.getElementsByClassName('data')[9].innerText;

            if(campo_motivo==''){

            }else{
                obj = {
                usuario: usuario,
                cte: cte,
                nome_cliente: nome_cliente,
                motivo: campo_motivo,
                responsabilidade: campo_responsabilidade,
                campo_observacao: campo_observacao,
                instrucaossw: instrucaossw,
                notafiscal: notafiscal,
                cliente_remetente: cliente_remetente,
                cliente_destino: cliente_destino,
                cidade_destino: cidade_destino
                }
                salva_bd(obj, 'justificativa');
                alert('Justificativa registrada.');
            }
        })
        /*
        Novo link com o nome de "Justificativa" -> no espaço em amarelo

    Tres campos :
    -Motivo: Lista de seleção (conforme abaixo)
    -Responsabilidade: conforme lista de seleção, bloqueado a alteração, puxa confome lista de cima
    - Obs: Campo de texto livre



    Lista de Selecao: FALHA OPERACIONAL
    AGENDADA PELO CLIENTE
    ATRASO NA TRANSFERENCIA EMBARCADORA
    CLIENTE SOLICITOU RETIRADA
    ATRASO NA SAIDA / CHEGADA/ DESCARGA
    FERIADO
    ATRASO  PENDENCIAS  
    FALTA PASSAGEM FISCAL
    TROCA UNIDADE SOL CLIENTE
    DATA DO COMPROVANTE 
    CLIENTE EM BALANÇO
    CLIENTE SEM EQUIPAMENTO PARA RECEBIMENTO
    CLIENTE AUSENTE
    CLIENTE FECHADO

    e no BD tem que salvar Numero do Cte com a sigla, nome cliente e os dados novos acima
    */
    }

    function marca_dagua() {
        ok = "";

        setInterval(() => {
            tela = document.getElementById("telaprog").textContent.substring(0, 10).trim();
            if ((tela == "ssw0019.17" || tela == "ssw0091.11" || tela == 'ssw0173.28' || tela == 'ssw0043.02' || '07ssw0054.23') && ok == "") {
                ok = "ok";
                marca = document.createElement('div');
                marca.setAttribute('id', 'marca');
                marca.setAttribute('style', 'position:absolute;font-size:250px;opacity:0.1;color:black;top:120px;left:120px;z-index:-100;');
                document.body.append(marca)
                document.getElementById('marca').style.webkitTransform = 'rotate(45deg)';
                document.getElementById('marca').innerText = getCookie('login');
            }
        }, 100);
        marca = document.createElement('div');
        marca.setAttribute('id', 'marca');
        marca.setAttribute('style', 'position:absolute;font-size:220px;opacity:0.1;color:black;top:120px;left:120px;z-index:-100;');
        document.body.append(marca)
        document.getElementById('marca').style.webkitTransform = 'rotate(45deg)';
        document.getElementById('marca').innerText = getCookie('login');
    }

    function cadastro_tabela() {
        grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
        usuario = getCookie('login');
        if(usuario == 'jheniffe' || usuario == 'otavio' || usuario == 'dejalmo' || usuario == 'artur'){
            cnpj = document.getElementsByClassName('data')[0].innerText;
            
            xmlhttp = new XMLHttpRequest(); //EXIBE TABELA COM CTES EM ACOMPANHAMENTO
            xmlhttp.onreadystatechange = function() {

            if (this.readyState == 4 && this.status == 200) {
                
                myObj = this.responseText;
                console.log('myobj='+myObj)
                x = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
                
                totalNum = x.length;
                if(totalNum>0){
                    i=totalNum-1;
                    reajuste = document.createElement('span');
                    reajuste.innerText = "% Reajuste: " + x[i].reajuste;
                    reajuste.setAttribute('style', 'position:absolute;left:1000px;top:400px;font-family:verdana;color:black;font-size:12px;')
                    document.body.append(reajuste);

                    dataa = document.createElement('span');
                    dataa.innerText = "Data de inclusão: " + x[i].data_incluida;
                    dataa.setAttribute('style', 'position:absolute;left:1000px;top:420px;font-family:verdana;color:black;font-size:12px;');
                    document.body.append(dataa);

                    dataa = document.createElement('span');
                    dataa.setAttribute('style', 'position:absolute;left:1000px;top:440px;font-family:verdana;color:black;font-size:12px;')
                    dataa.innerText = 'Data de recebimento:' + x[i].data_recebida;
                    document.body.append(dataa);

                    troca_melhoria = document.createElement('span');
                    troca_melhoria.innerText = 'Troca de melhoria: ' + x[i].troca_melhoria;
                    troca_melhoria.setAttribute('style', 'position:absolute;left:1000px;top:460px;font-family:verdana;color:black;font-size:12px;')
                    document.body.append(troca_melhoria);

                    if(x[i].vendedor=='' || x[i].vendedor==undefined){

                    }else{
                        vendedor = document.createElement('span');
                    vendedor.setAttribute('style', 'position:absolute;left:1000px;top:480px;font-family:verdana;color:black;font-size:12px;');
                    vendedor.innerText = 'Vendedor: ' + x[i].vendedor;
                    document.body.append(vendedor);
                    }
                    
                    if(x[i].unidade == '' || x[i].unidade == undefined){

                    }else{
                        unidade = document.createElement('span');
                        unidade.setAttribute('style', 'position:absolute;left:1000px;top:500px;font-family:verdana;color:black;font-size:12px;')
                        unidade.innerText = "Unidade: "  + x[i].unidade;
                        document.body.append(unidade);
                    }

                   

                }
                

            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=verifica_tabela&cnpj=" + cnpj, true);
        xmlhttp.send();



        }


        if (grupo == '9' || grupo == '09' || grupo == '38' || grupo == '52' || grupo == '18' || grupo == '7' || grupo == '07') {

            //título CADASTRO TABELA
            titulo_tabela = document.createElement('div');
            titulo_tabela.innerHTML = '<b>Cadastro Tabela</b>';
            titulo_tabela.setAttribute('id', 'titulo_tabela');
            titulo_tabela.setAttribute('style', 'font-family:verdana;font-size:10px;color:red;left:1050px;top:200px;')
            document.body.append(titulo_tabela)

            //data recebida (date)
            data_recebida = document.createElement('div');
            data_recebida.innerText = 'Data Recebida:';
            data_recebida.setAttribute('id', 'data_recebida_tit')
            data_recebida.setAttribute('style', 'font-family:verdana');
            data_recebida.style.top = '240px';
            data_recebida.style.left = '1000px';
            data_recebida_campo = document.createElement('input');
            data_recebida_campo.setAttribute('type', 'date');
            data_recebida_campo.style.top = '240px';
            data_recebida_campo.style.left = '1100px';
            data_recebida_campo.setAttribute('id', 'data_recebida');
            document.body.append(data_recebida);
            document.body.append(data_recebida_campo);

            //data incluída (date)
            data_incluida = document.createElement('div');
            data_incluida.innerText = 'Data Incluida';
            data_incluida.setAttribute('id', 'data_incluida_tit')
            data_incluida.setAttribute('style', 'font-family:verdana');
            data_incluida.style.top = '260px';
            data_incluida.style.left = '1000px';
            data_incluida_campo = document.createElement('input');
            data_incluida_campo.setAttribute('type', 'date');
            data_incluida_campo.setAttribute('id', 'data_incluida');
            data_incluida_campo.style.top = '260px';
            data_incluida_campo.style.left = '1100px';
            document.body.append(data_incluida);
            document.body.append(data_incluida_campo);

            //Negociação (drop-down)
            negociacao = document.createElement('div');
            negociacao.innerText = 'Negociação:';
            negociacao.setAttribute('id', 'negociacao_tit');
            negociacao.setAttribute('style', 'font-family:verdana');
            negociacao.style.top = '280px';
            negociacao.style.left = '1000px';
            negociacao_campo = document.createElement('select');
            negociacao_campo.setAttribute('style', 'font-family:verdana;border:1px solid lightgrey;font-size:10px');
            negociacao_campo.setAttribute('id', 'negociacao')
            negociacao_campo.style.top = '280px';
            negociacao_campo.style.left = '1100px';
            document.body.append(negociacao);
            document.body.append(negociacao_campo);
            opcao = document.createElement('option');
            opcao.text = '';
            negociacao_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'Conquista';
            negociacao_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'Reajuste';
            negociacao_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'Inclusão Rota';
            negociacao_campo.appendChild(opcao);

            //% Reajuste (numero?)
            reajuste = document.createElement('div');
            reajuste.innerText = '% Reajuste:';
            reajuste.setAttribute('id', 'reajuste_tit');
            reajuste.setAttribute('style', 'font-family:verdana')
            reajuste.style.top = '300px';
            reajuste.style.left = '1000px';
            reajuste_campo = document.createElement('input');
            reajuste_campo.setAttribute('type', 'number');
            reajuste_campo.setAttribute('id', 'reajuste')
            reajuste_campo.style.top = '300px';
            reajuste_campo.style.left = '1100px';
            document.body.append(reajuste);
            document.body.append(reajuste_campo);
            novocampo = document.createElement('input');
            novocampo.setAttribute('id', 'novocampo');
            novocampo.setAttribute('style', 'visibility:hidden');
            document.body.append(novocampo);
            document.getElementById('reajuste').addEventListener('change', ()=>{
                
            enviaAjax('ssw0054','act=GER&data_ini=300122&data_fin=090222&c_selecionar=T&c_entrega=T&c_listar=V&c_tipo=E&cliente_cgc=01581193000508&seq_cliente=537913&cliente=FORMULA%20PRODUTOS%20AUTOMOTI%20%28A%2E%29&dummy=1644416896972',(response)=>{

                ini=response.indexOf('left:208px;top:352px;width:104px;')
                fim=response.indexOf('</div>',ini)
                
                console.log(response.substring(ini+35,fim).trim())
                document.getElementById('novocampo').value = response.substring(ini+35,fim).trim();    
                });
            })
            




            //Tipo Acordo (drop-down)
            tipo_acordo = document.createElement('div');
            tipo_acordo.setAttribute('id', 'tipo_acordo_tit');
            tipo_acordo.innerText = 'Tipo Acordo:';
            tipo_acordo.setAttribute('style', 'font-family:verdana')
            tipo_acordo.style.top = '320px';
            tipo_acordo.style.left = '1000px';
            tipo_acordo_campo = document.createElement('select');
            tipo_acordo_campo.setAttribute('style', 'border: 1px solid lightgrey;font-family:verdana;font-size:10px');
            tipo_acordo_campo.setAttribute('id', 'tipo_acordo');
            tipo_acordo_campo.style.top = '320px';
            tipo_acordo_campo.style.left = '1100px';
            document.body.append(tipo_acordo);
            opcao = document.createElement('option');
            opcao.text = '';
            tipo_acordo_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'Embarcadora';
            tipo_acordo_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'RTE';
            tipo_acordo_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'Regional';
            tipo_acordo_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'E-Commerce';
            tipo_acordo_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'Serviços';
            tipo_acordo_campo.appendChild(opcao);
            opcao = document.createElement('option');
            opcao.text = 'Geral';
            tipo_acordo_campo.appendChild(opcao);
            document.body.append(tipo_acordo_campo);

            troca_melhoria = document.createElement('div');
            troca_melhoria.innerText = 'Troca de Melhoria:';
            troca_melhoria.setAttribute('style', 'font-family:verdana');
            troca_melhoria.style.top = '340px';
            troca_melhoria.style.left = '1000px';
            troca_melhoria.setAttribute('id', 'troca_melhoria');
            troca_melhoria_campo = document.createElement('input');
            troca_melhoria_campo.setAttribute('type', 'text');
            troca_melhoria_campo.setAttribute('id', 'troca_melhoria_campo');
            troca_melhoria_campo.setAttribute('style', 'position:absolute;border:1px solid lightgrey;font-family:verdana;font-size:10px');
            troca_melhoria_campo.style.top = '340px';
            troca_melhoria_campo.style.left = '1100px';
            document.body.append(troca_melhoria);
            document.body.append(troca_melhoria_campo);

            //botão INSERIR
            botao_inserir = document.createElement('a');
            botao_inserir.setAttribute('href', '#');
            botao_inserir.setAttribute('id', 'botao_de_inserir');
            botao_inserir.setAttribute('style', 'font-family:verdana;font-size:10px;text-decoration:none;color:blue');
            botao_inserir.style.top = '360px';
            botao_inserir.style.left = '1000px';
            botao_inserir.innerText = 'Inserir';
            document.body.append(botao_inserir)

            document.getElementById('botao_de_inserir').addEventListener('click', () => {
                usuario = getCookie('login');
                cliente = document.getElementsByClassName('data')[3].innerText;
                cnpj = document.getElementsByClassName('data')[0].innerText
                data_recebida = document.getElementById('data_recebida').value
                data_incluida = document.getElementById('data_incluida').value
                negociacao = document.getElementById('negociacao').value;
                reajuste = document.getElementById('reajuste').value;
                tipo_acordo = document.getElementById('tipo_acordo').value;
                troca_melhoria = document.getElementById('troca_melhoria_campo').value;
                novocampo = document.getElementById('novocampo').value;
                unidade_responsavel = document.getElementsByClassName('data')[18].innerText;
                vendedor = document.getElementsByClassName('data')[14].innerText;
                console.log(cliente);
                console.log(cnpj);
                console.log(data_incluida);
                console.log(negociacao);
                console.log(reajuste);
                console.log(tipo_acordo);
                obj = {
                    usuario:usuario,
                    cliente: cliente,
                    cnpj: cnpj,
                    data_recebida: data_recebida,
                    data_incluida: data_incluida,
                    negociacao: negociacao,
                    reajuste: reajuste,
                    tipo_acordo: tipo_acordo,
                    troca_melhoria: troca_melhoria,
                    novocampo: novocampo,
                    vendedor: vendedor,
                    unidade_responsavel: unidade_responsavel
                }
                if(data_recebida == '' || data_incluida == '' || negociacao == '' || reajuste == '' || tipo_acordo == ''){
                    alert('Preencha todos os campos.');
                }else{
                    salva_bd(obj, 'cadastro_tabela');
                alert('Tabela inserida com sucesso');
                document.getElementById('data_recebida').style.visibility = 'hidden';
                document.getElementById('data_incluida').style.visibility = 'hidden';
                document.getElementById('negociacao').style.visibility = 'hidden';
                document.getElementById('reajuste').style.visibility = 'hidden';
                document.getElementById('tipo_acordo').style.visibility = 'hidden';
                document.getElementById('botao_de_inserir').style.visibility = 'hidden';
                
                document.getElementById('troca_melhoria').style.visibility = 'hidden';
                document.getElementById('tipo_acordo_tit').style.visibility = 'hidden';
                document.getElementById('reajuste_tit').style.visibility = 'hidden';
                document.getElementById('negociacao_tit').style.visibility = 'hidden';
                document.getElementById('data_incluida_tit').style.visibility = 'hidden';
                document.getElementById('data_recebida_tit').style.visibility = 'hidden';
                document.getElementById('titulo_tabela').style.visibility = 'hidden';
                document.getElementById('troca_melhoria_campo').style.visibility = 'hidden';


                }
            })

            grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
            usuario = getCookie('login');
            if (grupo == '09' || usuario == 'jheniffe' || grupo == '9' || grupo == '18' || grupo == '52' || usuario == 'bruno' || grupo == '7' || grupo == '07' || usuario == 'jheniffe') {
                botao_relatorio_tabelas = document.createElement('a');
                botao_relatorio_tabelas.setAttribute('id', 'botao_relatorio_tabelas');
                botao_relatorio_tabelas.innerText = 'Tabelas Cadastradas';
                botao_relatorio_tabelas.setAttribute('href', 'https://sswresponse.azurewebsites.net/relatorio.php?auth=tabelas');
                botao_relatorio_tabelas.setAttribute('style', 'font-family:verdana;font-size:10px;text-decoration:none;color:blue;');
                botao_relatorio_tabelas.style.top = '360px';
                botao_relatorio_tabelas.style.left = '1100px';
                document.body.append(botao_relatorio_tabelas);
            }
        }



    }

    function op483() {

        document.getElementById('2').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('2').value = pastedData;
        });



    }

    function op103_tabela() {

        usuario = getCookie('login');
        node = document.createElement("table");
        node.setAttribute("id", "tabela");
        node.setAttribute("class", "srdiv");
        node.setAttribute("style", "table-layout: fixed;");
        document.body.append(node);

        tabela2 = document.createElement('table');
        tabela2.setAttribute('id', 'tabela2')
        tabela2.setAttribute('style', 'margin-top:100px;margin-left:600px;')
        document.querySelector('body').append(tabela2)

        xmlhttp = new XMLHttpRequest(); //EXIBE TABELA COM CTES EM ACOMPANHAMENTO
        xmlhttp.onreadystatechange = function() {

            if (this.readyState == 4 && this.status == 200) {
                estilo = ' style="cursor: pointer; background: rgb(255, 255, 255); position: relative; text-decoration: none;" ';
                myObj = this.responseText;
                console.log(myObj)
                x = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
                console.log(x.length);
                html = '';
                html += '<tr class="srtr2" style="cursor: default;">';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">N° da Coleta</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Remetente</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Destino</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Observação</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Remover</a></div></td>';
                html += '</tr>';
                totalNum = x.length;

                for (var i = 0; i < x.length; i++) {
                    html += '<tr class="srtr2" id="linha' + i + '">';
                    html += '<td class="srtd2"><div class="srdvl" id="num' + i + '">' + x[i].unidade + ' ' + x[i].numero + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl">' + x[i].remetente + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl">' + x[i].destinatario + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl">' + x[i].observacao + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl"><a href="#" class="imglnk sac" style="position:relative;" id="n' + i + '">X</a></div></td>';
                }
                html += '</tr>';
                document.getElementById('tabela2').innerHTML = html;
                for (i = 0; i < totalNum; i++) { //arma todos os botões remover da tabela
                    document.getElementById('n' + i).addEventListener('click', function(event) {
                        numeroARemover = document.getElementById('num' + event.target.id.substr(1)).innerHTML.substr(4);
                        usuario = getCookie('login')
                        obj = {
                            numero: numeroARemover,
                            usuario: usuario
                        }
                        salva_bd(obj, 'rem_acoleta');
                        setTimeout(function() {
                            location.reload();
                        }, 2000)
                    });
                }
            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=coletas_acompanhando&usuario=" + usuario, true);
        xmlhttp.send();

        var table2 = document.getElementById('tabela2');
        table2.addEventListener('click', function(e) {
            if (e.target.nodeName.toUpperCase() == "DIV") {
                if (e.target.id) {
                    document.getElementById("5").value = e.target.innerHTML.substr(4);
                    document.getElementById('6').click();
                    setCookie("clicar", "ocorrencia", 1);
                }
            }
            return;
        });

        document.getElementById('5').focus();
    }


    function op001_acompanhar() {
        acompanhar = document.createElement('a');
        acompanhar.innerHTML = "Acompanhar Coleta";
        acompanhar.setAttribute('id', 'acompanhar_coleta');
        acompanhar.setAttribute('href', '#')
        acompanhar.setAttribute('style', 'position:absolute;left:864px;top:550px;color:black;font-family:verdana;text-decoration:none;color:navy;font-size:11px;');
        document.body.append(acompanhar);
        observacao = document.createElement('input');
        observacao.setAttribute('id', 'observacao');
        observacao.setAttribute('style', 'position:absolute;left:710px;top:550px;width:150px;');
        observacao.setAttribute('placeholder', 'Digite um comentário');
        document.body.append(observacao);

        setInterval(() => {
            if (document.getElementById('acompanhar_coleta') == null) {
                acompanhar = document.createElement('a');
                acompanhar.innerHTML = "Acompanhar Coleta";
                acompanhar.setAttribute('id', 'acompanhar_coleta');
                acompanhar.setAttribute('href', '#');
                acompanhar.setAttribute('style', 'position:absolute;left:864px;top:550px;color:black;font-family:verdana;text-decoration:none;color:navy;font-size:11px;');
                document.body.append(acompanhar);
                observacao = document.createElement('input');
                observacao.setAttribute('id', 'observacao');
                observacao.setAttribute('style', 'position:absolute;left:710px;top:550px;width:150px;');
                observacao.setAttribute('placeholder', 'Digite um comentário');
                document.body.append(observacao);
                document.getElementById('acompanhar_coleta').addEventListener('click', () => {
                    remetente = document.getElementById('_nome_emit').value;
                    destinatario = document.getElementById('_nome_dest').value;
                    unidade = document.getElementById('fil_col').value;
                    numero = document.getElementById('coleta').value;
                    usuario = getCookie('login');
                    observacao = document.getElementById('observacao').value;
                    obj = {
                        unidade: unidade,
                        numero: numero,
                        usuario: usuario,
                        observacao: observacao,
                        rem: remetente,
                        dest: destinatario
                    };
                    salva_bd(obj, 'acompanhar_coleta');
                });
                document.getElementById('acompanhar_coleta').addEventListener('mouseover', () => {
                    document.getElementById('acompanhar_coleta').style.color = 'red';
                });
                document.getElementById('acompanhar_coleta').addEventListener('mouseout', () => {
                    document.getElementById('acompanhar_coleta').style.color = 'navy';
                });
            }
            if (document.getElementById('devolucao').value == '') {
                document.getElementById('acompanhar_coleta').style.visibility = 'hidden';
                document.getElementById('observacao').style.visibility = 'hidden';
            } else {
                document.getElementById('acompanhar_coleta').style.visibility = 'visible';
                document.getElementById('observacao').style.visibility = 'visible';
            }
        }, 1000);



        document.getElementById('acompanhar_coleta').addEventListener('click', () => {
            remetente = document.getElementById('_nome_emit').value;
            destinatario = document.getElementById('_nome_dest').value;
            unidade = document.getElementById('fil_col').value;
            numero = document.getElementById('coleta').value;
            usuario = getCookie('login');
            observacao = document.getElementById('observacao').value;
            obj = {
                unidade: unidade,
                numero: numero,
                usuario: usuario,
                observacao: observacao,
                rem: remetente,
                dest: destinatario
            };
            salva_bd(obj, 'acompanhar_coleta');
        });
        document.getElementById('acompanhar_coleta').addEventListener('mouseover', () => {
            document.getElementById('acompanhar_coleta').style.color = 'red';
        });
        document.getElementById('acompanhar_coleta').addEventListener('mouseout', () => {
            document.getElementById('acompanhar_coleta').style.color = 'navy';
        });
    }

    function op103_acompanhar() {
        acompanhar = document.createElement('a');
        acompanhar.innerHTML = "Acompanhar Coleta";
        acompanhar.setAttribute('id', 'acompanhar_coleta');
        acompanhar.setAttribute('href', '#')
        acompanhar.setAttribute('style', 'position:absolute;left:864px;top:520px;color:black;font-family:verdana;text-decoration:none;color:navy;font-size:11px;');
        document.body.append(acompanhar);
        observacao = document.createElement('input');
        observacao.setAttribute('id', 'observacao');
        observacao.setAttribute('style', 'position:absolute;left:760px;top:520px;width:100px;');
        observacao.setAttribute('placeholder', 'Digite um comentário');
        document.body.append(observacao);

        document.getElementById('acompanhar_coleta').addEventListener('click', () => {

            unidade = document.getElementsByClassName('data')[0].innerText.substring(0, 4).trim();
            numero = document.getElementsByClassName('data')[0].innerText.substring(4, 10).trim();
            usuario = getCookie('login');
            remetente = document.getElementsByClassName('data')[3].textContent.substr(15);
            destinatario = document.getElementsByClassName('data')[8].textContent.substr(15);
            observacao = document.getElementById('observacao').value;
            obj = {
                unidade: unidade,
                numero: numero,
                usuario: usuario,
                observacao: observacao,
                rem: remetente,
                dest: destinatario
            };
            salva_bd(obj, 'acompanhar_coleta');
        });
        document.getElementById('acompanhar_coleta').addEventListener('mouseover', () => {
            document.getElementById('acompanhar_coleta').style.color = 'red';
        });
        document.getElementById('acompanhar_coleta').addEventListener('mouseout', () => {
            document.getElementById('acompanhar_coleta').style.color = 'navy';
        });
    }

    function op001_cnpj() {

        document.getElementById('35').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('35').value = pastedData;
        });
        document.getElementById('19').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('19').value = pastedData;
        });
        document.getElementById('51').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('51').value = pastedData;
        });
        document.getElementById('48').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('48').value = pastedData;
        });
        document.getElementById('15').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('15').value = pastedData;
        });

    }

    function op102_analises() {
        //EXIBE TABELA COM SOLICITAÇÕES DE ANALISE DE CREDITO PARA GRUPO 43
        setInterval(function() {
            if (getCookie('attm') == 'atualizar') {
                location.reload();
                setCookie('attm', '', -2);
            }
        }, 500)
        
        grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
        tabela2 = document.createElement('table');
        tabela2.setAttribute('id', 'tabela2')
        tabela2.setAttribute('style', 'margin-top:300px;margin-left:20px;')
        document.querySelector('body').append(tabela2)

            


        if (grupo == "43" || grupo =='18' || grupo == '7' || grupo == '07' || usuario == 'lidiane' || usuario == 'ligia' || usuario == 'erenilda' || usuario == 'luciana' || usuario == 'artur' || usuario == 'jheniffe') {
            date = new Date();
            hoje = date.getDate() + "/" + (date.getMonth()+1)
            span = document.createElement('a');
            span.setAttribute('href', 'https://sswresponse.azurewebsites.net/relatorio.php?auth=credito')
            span.setAttribute('style', 'position:absolute;margin-top:15px;margin-left:30px;font-family:verdana;font-size:12px;color:black;')
            span.innerText = 'Relatório'
            document.querySelector('body').append(span);
            html = '';

            xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    estilo = ' style="cursor: pointer; background: rgb(255, 255, 255); position: relative; text-decoration: none;" ';
                    myObj = this.responseText;
                    console.log(myObj)
                    x = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
                    html = '';
                    if (x.length > 0) {
                        html += '<tr class="srtr2" style="cursor: default;">';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">CNPJ</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Remetente</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Análise de Crédito</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Requerido por</a></div></td>';
                        html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Data</a></div></td>';
                        html += '</tr>';
                    }
                    ndescon = x.length;
                    for (var i = 0; i < x.length; i++) {
                        cor = i % 2 == 0 ? '" bg="#ffffff" ' : '" bg="#eeeeee" ';
                        html += '<tr class="srtr2"' + cor + estilo + '>';
                        html += '<td class="srtd2"><div class="srdvl" id="'+x[i].cte+'">' + x[i].cte + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="'+x[i].cte+'">' + x[i].rem + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="'+x[i].cte+'">' + x[i].status + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="'+x[i].cte+'">' + x[i].usuario + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl" id="'+x[i].cte+'">' + x[i].desde + '</div></td>';
                        html += '</tr>';
                    }
                }
                document.getElementById('tabela2').innerHTML = html;

            }

            xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=credito_exibe&hoje=" + hoje, true);
            xmlhttp.send();

            var table2 = document.getElementById('tabela2');
            table2.addEventListener('click', function(e) {
                if (e.target.nodeName.toUpperCase() == "DIV") {
                    if (e.target.id) {
                        document.getElementById("cnpj_cliente").value = e.target.getAttribute('id');
                        document.getElementById('btn_env_cnpj_cliente').click();
                        setCookie("clicar", "ocorrencia", 1)
                    }
                }
                return;
            });

            document.getElementById('cnpj_cliente').focus();
        }
    }


    function op457_cookie() {
        if (getCookie('faturatemp')) {
            document.getElementById('t_nro_fatura').value = getCookie('faturatemp')
            setCookie('faturatemp', '', -2)
            document.getElementById('1').click();
        }
    }

    function descontos_faturas() {
        //cria 2 cookies temporários para auto-completar um campo em seguida
        document.getElementById('4').addEventListener('click', () => {
            nome_carteira = document.getElementsByClassName('data')[19].innerText;
            nome_Cliente = document.getElementsByClassName('data')[25].innerText;
            valor_fatura = document.getElementsByClassName('data')[12].innerText;
            setCookie('nome_carteira', nome_carteira, 1);
            setCookie('nome_Cliente', nome_Cliente, 1);
            setCookie('valor_fatura', valor_fatura, 1);
        });
        /*


        ctrcfatura = document.getElementsByClassName('data')[0].textContent;
        xmlhttp = new XMLHttpRequest();                                     //consulta a tabela "descontos" para exibir o info/formulario condizente
        xmlhttp.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200){
                myObj = this.responseText;
                x=JSON.parse(myObj);
                if(x.length>0){
                    if(x[0].status=='solicitando'){
                        campo = document.createElement('span')
                        campo.setAttribute('style', 'position:absolute;left:730px;top:120px;color:navy;font-size:12px;font-family:verdana')
                        campo.innerHTML = '<b>Solicitação Desconto</b>:'
                        document.querySelector('body').append(campo);
                        campo = document.createElement('span')
                        campo.setAttribute('style', 'position:absolute;left:650px;top:150px;color:black;font-size:12px;font-family:verdana')
                        campo.innerHTML = 'Data Solicitação:'
                        document.querySelector('body').append(campo);
                        campo = document.createElement('input')
                        campo.setAttribute('style', 'position:absolute;left:770px;top:150px;color:black;font-size:12px;font-family:verdana;width:20ch;border:0px;');
                        var data = new Date();
                        data = data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
                        campo.value = data;
                        campo.setAttribute('id', 'data_solicitacao');           //#data_solicitacao
                        document.querySelector('body').append(campo);
                        document.getElementById('data_solicitacao').disabled = true;
                        campo = document.createElement('span')
                        campo.setAttribute('style', 'position:absolute;left:650px;top:170px;color:black;font-size:12px;font-family:verdana')
                        campo.innerHTML = 'Motivo:'
                        document.querySelector('body').append(campo);
                        motivos_campo = document.createElement('select');
                        motivos_campo.setAttribute('style', 'position:absolute;left:770px;top:170px;color:black;font-size:10px;font-family:verdana;width:24ch;border:1px solid lightgrey');
                        motivos_campo.setAttribute('id', 'motivo_desconto');
                        
                        motiv = document.createElement('option');
                        motiv.text = '';
                        motivos_campo.appendChild(motiv);
                        for(i=0;i<motivos.length;i++){
                            motiv = document.createElement('option');
                            motiv.text = motivos[i];
                            motivos_campo.appendChild(motiv);
                        }
                        document.querySelector('body').append(motivos_campo);
                        document.getElementById('motivo_desconto').addEventListener('change', ()=>{
                            if(document.getElementById('motivo_desconto').value == '25-OUTROS DETALHE Caso não se enquandre em uns dos motivos acima, detalhe o motivo do seu desconto'){
                                campo=document.createElement('input');
                                campo.setAttribute('style', 'left:930px;top:172px;width:20ch;font-family:verdana;font-size:12px;color:black');
                                campo.setAttribute('placeholder', 'Qual outro motivo?...');
                                document.getElementById('motivo_desconto').id='ex_motivo_desconto';
                                campo.setAttribute('id', 'motivo_desconto');
                                document.querySelector('body').append(campo);
                            }else{
                                if(document.getElementById('ex_motivo_desconto')){
                                    document.getElementById('motivo_desconto').style.visibility= 'hidden';
                                    document.getElementById('motivo_desconto').id='nenhum';
                                    document.getElementById('ex_motivo_desconto').id='motivo_desconto';
                                }
                            }
                        })
                        campo = document.createElement('span')
                        campo.setAttribute('style', 'position:absolute;left:650px;top:190px;color:black;font-size:12px;font-family:verdana')
                        campo.innerHTML = 'Nome Cliente:'
                        document.querySelector('body').append(campo);
                        campo = document.createElement('input')
                        campo.setAttribute('id', 'nome_clienteD');          //#nome_cliente
                        campo.setAttribute('style', 'position:absolute;left:770px;top:190px;color:black;font-size:12px;font-family:verdana;width:20ch')
                        document.querySelector('body').append(campo);
                        campo = document.createElement('span')
                        campo.setAttribute('style', 'position:absolute;left:650px;top:210px;color:black;font-size:12px;font-family:verdana')
                        campo.innerHTML = 'Telefone Cliente:'
                        document.querySelector('body').append(campo);
                        campo = document.createElement('input')
                        campo.setAttribute('id', 'telefone_cliente')        //#telefone_cliente
                        campo.setAttribute('style', 'position:absolute;left:770px;top:210px;color:black;font-size:12px;font-family:verdana;width:20ch')
                        document.querySelector('body').append(campo);
                        campo = document.createElement('span')
                        campo.setAttribute('style', 'position:absolute;left:650px;top:230px;color:black;font-size:12px;font-family:verdana')
                        campo.innerHTML = 'E-mail Cliente:'
                        document.querySelector('body').append(campo);
                        campo = document.createElement('input')
                        campo.setAttribute('id', 'email_cliente');          //#email_cliente
                        campo.setAttribute('style', 'position:absolute;left:770px;top:230px;color:black;font-size:12px;font-family:verdana;width:20ch')
                        document.querySelector('body').append(campo);
                        campo = document.createElement('a');            //#botaosolicitar
                        campo.setAttribute('href', '#');
                        campo.text = 'Solicitar'
                        campo.setAttribute('id', 'botaosolicitar')
                        campo.setAttribute('style', 'font-family:verdana;font-size:12px;color:navy;top:256px;left:811px;padding:1px;')
                        document.querySelector('body').append(campo);
                        document.getElementById('botaosolicitar').addEventListener('mouseover', ()=>{
                            document.getElementById('botaosolicitar').style.color = 'red';                          
                        });
                        document.getElementById('botaosolicitar').addEventListener('mouseout', ()=>{
                            document.getElementById('botaosolicitar').style.color = 'navy';
                        });
                        document.getElementById('botaosolicitar').addEventListener('click', ()=>{
                            ctrcfatura = document.getElementsByClassName('data')[0].textContent
                            email_cliente = document.getElementById('email_cliente').value;
                            telefone_cliente = document.getElementById('telefone_cliente').value;
                            nome_clienteD = document.getElementById('nome_clienteD').value;
                            motivo_desconto = document.getElementById('motivo_desconto').value;
                            data_solicitacao = document.getElementById('data_solicitacao').value;
                            if(data_solicitacao == '' || motivo_desconto == '' || nome_clienteD == '' || telefone_cliente == '' || email_cliente == '' || ctrcfatura == ''){
                                alert('TODOS OS CAMPOS SÃO OBRIGATÓRIOS!')
                            }else{
                            obj={descontoacao:'solicita2', ctrcfatura:ctrcfatura, status:'solicitado', email_cliente:email_cliente, telefone_cliente:telefone_cliente, nome_clienteD:nome_clienteD, motivo_desconto:motivo_desconto, data_solicitacao:data_solicitacao}
                            salva_bd(obj, 'desconto');
                            setTimeout(function(){
                                var fatura = document.getElementsByClassName('data')[0].textContent.substring(0,7).trim()
                                setCookie('faturatemp', fatura, 365)
                                location.reload();
                            },1000)
                            }
                        })
                    }else if(x[0].status=='solicitado'){
                        if(document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length-2)=='9' || document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length-2)=='38' || document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length-2)=='52'){
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:730px;top:120px;color:navy;font-size:12px;font-family:verdana;width:25ch;')
                            campo.innerHTML = '<b>Confirmação de Desconto</b>:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:650px;top:150px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Data Retorno:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('input')
                            campo.setAttribute('id', 'data_retorno');               //#data_retorno
                            var data = new Date();
                            data = data.getDate()+"/"+(data.getMonth()+1)+"/"+data.getFullYear();
                            campo.value=data;
                            campo.setAttribute('style', 'position:absolute;left:770px;top:150px;color:black;font-size:12px;font-family:verdana;width:20ch;border:0px;')
                            document.querySelector('body').append(campo);
                            document.getElementById('data_retorno').disabled = true
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:650px;top:170px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Valor Desconto:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('span');
                            campo.innerHTML = 'R$'
                            campo.setAttribute('style', 'position:absolute;left:770px;top:168px;font-family:verdana;font-size:12px;color:black')
                            document.querySelector('body').append(campo)
                            campo = document.createElement('input')                 //#valor_desconto
                            campo.setAttribute('type', 'number')
                            campo.setAttribute('id', 'valor_desconto');
                            campo.setAttribute('style', 'position:absolute;left:790px;top:170px;color:black;font-size:12px;font-family:verdana;width:7ch')
                            document.querySelector('body').append(campo);
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:650px;top:190px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Filial Resp.:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('input')
                            campo.setAttribute('id', 'filial_responsavel');         //#filial_responsavel
                            campo.setAttribute('style', 'position:absolute;left:770px;top:190px;color:black;font-size:12px;font-family:verdana;width:20ch')
                            document.querySelector('body').append(campo);
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:650px;top:210px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Setor Resp.:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('input')
                            campo.setAttribute('id', 'setor_responsavel');          //#setor_responsavel
                            campo.setAttribute('style', 'position:absolute;left:770px;top:210px;color:black;font-size:12px;font-family:verdana;width:20ch')
                            document.querySelector('body').append(campo);
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:650px;top:230px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Motivo:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('input')
                            campo.setAttribute('style', 'position:absolute;left:770px;top:230px;color:black;font-size:12px;font-family:verdana;width:20ch')
                            campo.setAttribute('id', 'motivo_desconto');            //#motivo_desconto
                            document.querySelector('body').append(campo);
                            campo = document.createElement('a');                    //#botão_aprovar
                            campo.setAttribute('href', '#');
                            campo.text = 'Aprovar'
                            campo.setAttribute('id', 'botao_aprovar')
                            campo.setAttribute('style', 'font-family:verdana;font-size:12px;color:navy;top:256px;left:870px;padding:1px;')
                            document.querySelector('body').append(campo);
                            document.getElementById('botao_aprovar').addEventListener('mouseover', ()=>{
                                document.getElementById('botao_aprovar').style.color = 'red';
                            });
                            document.getElementById('botao_aprovar').addEventListener('mouseout', ()=>{
                                document.getElementById('botao_aprovar').style.color = 'navy';
                            });
                            document.getElementById('botao_aprovar').addEventListener('click', ()=>{
                                motivo_desconto = document.getElementById('motivo_desconto').value;
                                setor_responsavel = document.getElementById('setor_responsavel').value;
                                filial_responsavel = document.getElementById('filial_responsavel').value;
                                valor_desconto = document.getElementById('valor_desconto').value;
                                data_retorno = document.getElementById('data_retorno').value;
                                ctrcfatura = document.getElementsByClassName('data')[0].textContent;
                                if(data_retorno == '' || valor_desconto == '' || filial_responsavel == '' || setor_responsavel == '' || motivo_desconto == '' || ctrcfatura == ''){
                                    alert('TODOS OS CAMPOS SÃO OBRIGATÓRIOS!')
                                }else{
                                    obj = {status:'aprovado', descontoacao:'lanca', motivo_desconto:motivo_desconto, setor_responsavel:setor_responsavel, filial_responsavel:filial_responsavel, valor_desconto:valor_desconto, data_retorno:data_retorno, ctrcfatura:ctrcfatura}
                                    salva_bd(obj, 'desconto');
                                    setTimeout(function(){window.close()}, 3500);
                                }
                            });
                            campo = document.createElement('a');                    //#botão_reprovado
                            campo.setAttribute('href', '#');
                            campo.text = 'Não aprovar'
                            campo.setAttribute('id', 'botao_reprovado')
                            campo.setAttribute('style', 'font-family:verdana;font-size:12px;color:navy;top:256px;left:770px;padding:1px;')
                            document.querySelector('body').append(campo);
                            document.getElementById('botao_reprovado').addEventListener('mouseover', ()=>{
                                document.getElementById('botao_reprovado').style.color = 'red';
                            });
                            document.getElementById('botao_reprovado').addEventListener('mouseout', ()=>{
                                document.getElementById('botao_reprovado').style.color = 'navy';
                            });
                            document.getElementById('botao_reprovado').addEventListener('click', ()=>{
                                motivo_desconto = document.getElementById('motivo_desconto').value;
                                setor_responsavel = document.getElementById('setor_responsavel').value;
                                filial_responsavel = document.getElementById('filial_responsavel').value;
                                document.getElementById('valor_desconto').value = '000';
                                valor_desconto = document.getElementById('valor_desconto').value;
                                data_retorno = document.getElementById('data_retorno').value
                                ctrcfatura = document.getElementsByClassName('data')[0].textContent
                                if(data_retorno == '' || valor_desconto == '' || filial_responsavel == '' || setor_responsavel == '' || motivo_desconto == '' || ctrcfatura == ''){
                                    alert('TODOS OS CAMPOS SÃO OBRIGATÓRIOS!')
                                }else{
                                    obj = {status:'não aprovado', descontoacao:'lanca', motivo_desconto:motivo_desconto, setor_responsavel:setor_responsavel, filial_responsavel:filial_responsavel, valor_desconto:valor_desconto, data_retorno:data_retorno, ctrcfatura:ctrcfatura}
                                    salva_bd(obj, 'desconto')
                                    setTimeout(function(){window.close()}, 3500)
                                }
                            });
                        }
                    }else{
                        campo = document.createElement('span')
                        campo.setAttribute('style', 'position:absolute;left:730px;top:120px;color:navy;font-size:12px;font-family:verdana')
                        campo.innerHTML = '<b>Desconto '+x[0].status+'. Valor: R$'+x[0].valor_desconto+'</b>';
                        document.querySelector('body').append(campo);
                    }
                }
            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=desconto&descontoacao=exibe&ctrcfatura="+ctrcfatura, true);
        xmlhttp.send();
        */
        /*
                                                        //cria botão "solicitar desconto" nas faturas - 457
                solicitar = document.createElement('a');
                solicitar.setAttribute('id', 'solicitardesconto')
                solicitar.setAttribute('href', '#');
                solicitar.setAttribute('style', 'font-family:verdana;color:navy;font-size:10px;left:850px;top:480px');
                solicitar.innerHTML = 'Solicitar Desconto';
                document.getElementById('frm').append(solicitar);
                document.getElementById('solicitardesconto').addEventListener('mouseover', ()=>{
                    document.getElementById('solicitardesconto').style.color = 'red';
                });
                document.getElementById('solicitardesconto').addEventListener('mouseout', ()=>{
                    document.getElementById('solicitardesconto').style.color = 'navy';
                });
                document.getElementById('solicitardesconto').addEventListener('click', ()=>{
                    fatura = document.getElementsByClassName('data')[0].innerText;
                    status='solicitando';
                    obj={ctrcfatura:fatura, status:status, descontoacao:'solicita'}
                    salva_bd(obj, 'desconto')
                    setTimeout(function(){
                        var fatura = document.getElementsByClassName('data')[0].textContent.substring(0,7).trim()
                        setCookie('faturatemp', fatura, 365)
                        location.reload();
                    },1000)
                });
            */
    }

    function descontos() {
        xmlhttp = new XMLHttpRequest(); //consulta a tabela "descontos" para exibir o info/formulario condizente
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                myObj = this.responseText;
                x = JSON.parse(myObj);
                if (x.length > 0) {
                    if (x[0].status == 'solicitado') { //exibe apenas para 9, 38 e 52
                        var grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
                        if (grupo == '9' || grupo == '18' || grupo == '38' || grupo == '52' || grupo == '09' || grupo == '7' || grupo == '07' || usuario=='jheniffe' || usuario=='artur') {
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:1070px;top:545px;color:navy;font-size:12px;font-family:verdana;width:25ch;')
                            campo.innerHTML = '<b>Confirmação de Desconto</b>:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('span')
                            campo.setAttribute('style', 'visibility:hidden;position:absolute;left:920px;top:550px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Data Retorno:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('input')
                            campo.setAttribute('id', 'data_retorno'); //#data_retorno
                            var data = new Date();
                            data = data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear();
                            campo.value = data;
                            campo.setAttribute('style', 'visibility:hidden;position:absolute;left:1040px;top:550px;color:black;font-size:12px;font-family:verdana;width:20ch;border:0px;')
                            document.querySelector('body').append(campo);
                            document.getElementById('data_retorno').disabled = true;


                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:1020px;top:570px;color:black;font-size:12px;font-family:verdana')
                            campo.setAttribute('id', 'desconto_titulo');
                            campo.innerHTML = 'Valor Desconto:'
                            document.querySelector('body').append(campo);
                            campo = document.createElement('span');
                            campo.innerHTML = 'R$'
                            campo.setAttribute('id', 'desconto_tituloo')
                            campo.setAttribute('style', 'position:absolute;left:1140px;top:567px;font-family:verdana;font-size:12px;color:black')
                            document.querySelector('body').append(campo)
                            campo = document.createElement('input') //#valor_desconto
                            campo.setAttribute('type', 'number')
                            campo.setAttribute('id', 'valor_desconto');
                            campo.setAttribute('style', 'position:absolute;left:1160px;top:570px;color:black;font-size:12px;font-family:verdana;width:7ch')
                            document.querySelector('body').append(campo);


                            campo = document.createElement('span') //filial responsável
                            campo.setAttribute('style', 'position:absolute;left:1020px;top:590px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Filial Resp.:'
                            document.querySelector('body').append(campo);
                            node = document.createElement("select");
                            node.setAttribute("id", "filial_responsavel");
                            node.setAttribute("style", "left:1140px; top:590px;text-align:left;font-size:10px;font-family:verdana;border:1px solid lightgrey");
                            node.setAttribute("class", "filial_responsavel");
                            document.querySelector('body').append(node);
                            option = document.createElement("option");
                            option.value = document.getElementsByClassName('data')[59].innerText.substring(0, 3);
                            option.text = document.getElementsByClassName('data')[59].innerText.substring(0, 3);
                            node.appendChild(option);
                            option = document.createElement("option");
                            option.value = document.getElementsByClassName('data')[62].innerText.substring(0, 3);
                            option.text = document.getElementsByClassName('data')[62].innerText.substring(0, 3);
                            node.appendChild(option);
                            option = document.createElement("option");
                            option.value = "Matriz"
                            option.text = "Matriz"
                            node.appendChild(option);
                            option = document.createElement("option");
                            option.value = "Cliente"
                            option.text = "Cliente"
                            node.appendChild(option);


                            /*
                            campo = document.createElement('input')
                            campo.setAttribute('id', 'filial_responsavel');         //#filial_responsavel
                            campo.setAttribute('style', 'position:absolute;left:940px;top:590px;color:black;font-size:12px;font-family:verdana;width:20ch')
                            document.querySelector('body').append(campo);
                            */


                            setores = ["CLIENTE", "CARGA", "COLETA DIURNA", "COLETA NOTURNA", "COMERCIAL", "ENTREGA", "EXPEDIÇÃO DIURNA", "EXPEDIÇÃO NOTURNO", "FINANCEIRO", "MATRIZ", "PARCEIRO", "PENDÊNCIA", "PONTO APOIO", "SISTEMA", "SUPERVISÃO", "TRAFEGO"]
                            node = document.createElement("select");
                            node.setAttribute("id", "setor_responsavel");
                            node.setAttribute('style', 'position:absolute;left:1140px;top:610px;color:black;font-size:10px;font-family:verdana;width:20ch;border:1px solid lightgrey')
                            node.setAttribute("class", "nodata formdesconto");
                            document.querySelector("body").append(node);
                            for (var i = 0; i < setores.length; i++) {
                                var option = document.createElement("option");
                                option.value = setores[i];
                                option.text = setores[i];
                                node.appendChild(option); //SETOR RESPONSÁVEL
                            }


                            campo = document.createElement('span')
                            campo.setAttribute('style', 'position:absolute;left:1020px;top:610px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Setor Resp.:'
                            document.querySelector('body').append(campo);




                            campo = document.createElement('span') //MOTIVOS
                            campo.setAttribute('style', 'position:absolute;left:1020px;top:630px;color:black;font-size:12px;font-family:verdana')
                            campo.innerHTML = 'Motivo:'
                            document.querySelector('body').append(campo);
                            motivos_campo = document.createElement('select');
                            motivos_campo.setAttribute('style', 'position:absolute;left:1140px;top:630px;color:black;font-size:10px;font-family:verdana;width:24ch;border:1px solid lightgrey');
                            motivos_campo.setAttribute('id', 'motivo_desconto');
                            motivos = ['1-CADASTRO DE CLIENTE INCORRETO Alterou de alguma forma o frete (ICMS, cobrança TDE, taxas)', '2-COBRANÇA TAXA INDEVIDA Cobrado taxas indevidas ( tas, TDE, ICMS, TAD)', '3-MERCADORIA DE USO UND PROPRIA/PARCEIRA  Não linhou a cortesia e cobrou frete / Não emitiram cortesia', '4-REVERSÃO DE FRETE / ALTERA TABELA Emitiu NF tomador incorreto, reverteu, porém, solicita desconto de acordo com tabela', '5-ERRO DO CLIENTE  EMISSAO NF   Cliente emitiu NF errada na qual interferiu no frete ( Valor, peso / inscrição / cidade )', '6-ERRO DO CLIENTE AO ENVIAR ARQUIVO EDI    Enviou arquivo errado para a carvalima', '7-REAJUSTE INDEVIDO   Matriz reajustou indevido / Cliente de outro grupo / Não passado para cliente especial', '8-COTACAO NÃO ACATADA POR DIVERGENCIA / NÃO CONTRATADA    Alterou os dados, cliente de recusa pagar / Alterou dados, não foi alterado / Cotação não foi contratada /', '9-DUPLICIDADE EMISSAO COM A MESMA NF  Há mais de uma emissão com a mesma NF', '10-FALTA / ERRO DE AGRUPAMENTO NF  Não agrupou as Nfs no CTRC ( mesmo CNPJ remet/desti , coleta do mesmo dia, mesma cidade destino)', '11-EMISSAO REMET/ DEST/TOMADOR INCORRETO/ DADOS DIVERGENTE  Tomador incorreto na emissão / Dados divergente ( peso, NF, cidade), não seguiu a NF', '12-NAO RESPEITOU MENSAGEM DE TELA   Havia alguma particulidade com o cliente e não foi acatado', '13-PESO / CUBAGEM INCORRETO EMISSAO   Emitido com peso errado / Cubagem lançada manual errada (enviar fotos comprovando)', '14-COTACAO NAO ACATADA NA EMISSAO Cotação contratada, porém, não acatada', '15-EMISSAO FORA TABELA /TRANS/DEVOL   Emitido no Fob Dirigido / Promocional / Generica e não foi acatada a tabela do cliente tomador', '16-ATRASO NO CADASTRO DA TABELA   Matriz não cadastrou no periodo de 48 horas', '17-TABELA CADASTRADA ERRADA  Erro no cadastro da tabela no sistema', '18-FALHA DO SISTEMA SSW  TI    SSW calculou errado / Puxou alguma taxa indevida / Erro no arquivo enviado pelo cliente', '19-FALHA FORMALIZAÇÃO DA TABELA  Supervisão / Matriz confecionou a tabela errada', '20-ATRASO/ PROBLEMA COLETA/ ENTREGA  Cliente solicita desconto devido a atraso na coleta / entrega', '21-SEM CARIMBO EXPRESS    Motorista não carimbou EXPRESS na declaração (enviar fotos comprovando)', '22-PROMOCIONAL COM RECUSA    Cliente se recusa em pagar, alegando valor alto (seguir o manual promocional)', '23-CÓDIGO INCORRETO NA EMISSÃO / Cliente possui tabela em outro código / outro serviço'];
                            motiv = document.createElement('option');
                            motiv.text = '';
                            motivos_campo.appendChild(motiv);
                            for (i = 0; i < motivos.length; i++) {
                                motiv = document.createElement('option');
                                motiv.text = motivos[i];
                                motivos_campo.appendChild(motiv);
                            }
                            document.querySelector('body').append(motivos_campo)
                            campo = document.createElement('a'); //#botão_aprovar
                            campo.setAttribute('href', '#');
                            campo.text = 'Aprovar'
                            campo.setAttribute('id', 'botao_aprovar')
                            campo.setAttribute('style', 'font-family:verdana;font-size:12px;color:navy;top:656px;left:1140px;padding:1px;')
                            document.querySelector('body').append(campo);
                            document.getElementById('botao_aprovar').addEventListener('mouseover', () => {
                                document.getElementById('botao_aprovar').style.color = 'red';
                            });
                            document.getElementById('botao_aprovar').addEventListener('mouseout', () => {
                                document.getElementById('botao_aprovar').style.color = 'navy';
                            });
                            document.getElementById('botao_aprovar').addEventListener('click', () => {
                                motivo_desconto = document.getElementById('motivo_desconto').value;
                                setor_responsavel = document.getElementById('setor_responsavel').value;
                                filial_responsavel = document.getElementById('filial_responsavel').value;
                                valor_desconto = document.getElementById('valor_desconto').value;
                                data_retorno = document.getElementById('data_retorno').value
                                ctrcfatura = document.getElementsByClassName('data')[2].innerText
                                usuario = getCookie("login");
                                if (data_retorno == '' || valor_desconto == '' || filial_responsavel == '' || setor_responsavel == '' || ctrcfatura == '') {
                                    alert('TODOS OS CAMPOS SÃO OBRIGATÓRIOS!')
                                } else {
                                    obj = {
                                        usuario_confirmacao: usuario,
                                        status: 'aprovado',
                                        descontoacao: 'lanca',
                                        motivo_desconto: motivo_desconto,
                                        setor_responsavel: setor_responsavel,
                                        filial_responsavel: filial_responsavel,
                                        valor_desconto: valor_desconto,
                                        data_retorno: data_retorno,
                                        ctrcfatura: ctrcfatura
                                    }
                                    salva_bd(obj, 'desconto')
                                    alert("Desconto aprovado com sucesso!")
                                }
                                setCookie("attm", "atualizar");
                                setTimeout(function() {
                                    window.close()
                                }, 2000);
                            });
                            campo = document.createElement('a'); //#botão_reprovado
                            campo.setAttribute('href', '#');
                            campo.text = 'Rejeitar'
                            campo.setAttribute('id', 'botao_reprovado')
                            campo.setAttribute('style', 'font-family:verdana;font-size:12px;color:navy;top:656px;left:1040px;padding:1px;width:11ch')
                            document.querySelector('body').append(campo);
                            document.getElementById('botao_reprovado').addEventListener('mouseover', () => {
                                document.getElementById('botao_reprovado').style.color = 'red';
                            });
                            document.getElementById('botao_reprovado').addEventListener('mouseout', () => {
                                document.getElementById('botao_reprovado').style.color = 'navy';
                            });
                            document.getElementById('botao_reprovado').addEventListener('click', () => {
                                motivo_desconto = document.getElementById('motivo_desconto').value;
                                setor_responsavel = document.getElementById('setor_responsavel').value;
                                filial_responsavel = document.getElementById('filial_responsavel').value;
                                document.getElementById('valor_desconto').value = '000';
                                valor_desconto = document.getElementById('valor_desconto').value;
                                data_retorno = document.getElementById('data_retorno').value
                                ctrcfatura = document.getElementsByClassName('data')[2].innerText
                                usuario = getCookie('login');
                                if (data_retorno == '' || valor_desconto == '' || filial_responsavel == '' || setor_responsavel == '' || ctrcfatura == '') {
                                    alert('TODOS OS CAMPOS SÃO OBRIGATÓRIOS!')
                                } else {
                                    obj = {
                                        usuario_confirmacao: usuario,
                                        status: 'não aprovado',
                                        descontoacao: 'lanca',
                                        motivo_desconto: motivo_desconto,
                                        setor_responsavel: setor_responsavel,
                                        filial_responsavel: filial_responsavel,
                                        valor_desconto: valor_desconto,
                                        data_retorno: data_retorno,
                                        ctrcfatura: ctrcfatura
                                    }
                                    salva_bd(obj, 'desconto')
                                    alert('Desconto recusado.')
                                }
                                setCookie("attm", "atualizar");
                                setTimeout(function() {
                                    window.close()
                                }, 2000);
                            });
                            document.getElementById("valor_desconto").value = x[0].valor_desconto;
                            document.getElementById("motivo_desconto").value = x[0].motivo;
                        }
                        solicitacao = document.createElement('span');
                        solicitacao.setAttribute('style', 'position:absolute;left:900px;top:400px;color:navy;font-size:12px;font-family:verdana;width:22ch');
                        solicitacao.innerHTML = "<b>Desconto solicitado - Por: " + x[0].usuario_solicitante + " - " + x[0].detalhe + "<br>No valor de -R$" + x[0].valor_desconto + "</b>";
                        document.querySelector("body").append(solicitacao);
                        var grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
                        usuario = getCookie('login');
                        if (grupo == "09" || grupo == "9" || grupo == '18' || grupo == "52" || usuario == 'bruno' || grupo == '7' || usuario == 'jheniffe' || grupo == '07') {
                            relatorio_descontos = document.createElement('a');
                            relatorio_descontos.setAttribute('href', 'https://sswresponse.azurewebsites.net/relatorio.php?auth=descontos');
                            relatorio_descontos.setAttribute('style', 'position:absolute;left:900px;top:450px;color:navy;font-size:12px;font-family:verdana;')
                            relatorio_descontos.innerText = 'Exibir todos os pedidos de desconto'
                            document.body.append(relatorio_descontos)
                        }

                    } else { //marcação pública de que há uma solicitação de desconto feita
                        estadoDesconto = document.createElement('span')
                        estadoDesconto.setAttribute('style', 'position:absolute;left:1000px;top:480px;color:navy;font-size:12px;font-family:verdana;width:22ch');
                        if (x[0].status == "não aprovado") {
                            estadoDesconto.innerHTML = "<b>Desconto não aprovado. - Por: " + x[0].usuario_confirmacao + " - </b>";
                            document.querySelector('body').append(estadoDesconto);
                        } else {
                            estadoDesconto.innerHTML = "<b>Desconto " + x[0].status + ". - Por: " + x[0].usuario_confirmacao + " - Valor: R$" + x[0].valor_desconto + " - Motivo: " + x[0].motivo + "</b>";
                            document.querySelector('body').append(estadoDesconto);
                        }
                    }
                } else { //form publico de solicitação
                    solicitarA = document.createElement('a');
                    solicitarA.innerHTML = "Solicitar";
                    solicitarA.setAttribute('id', 'solicitar_descontoA');
                    solicitarA.setAttribute('href', '#');
                    solicitarA.setAttribute('style', 'position:absolute;color:navy;left:1010px;top:677px;font-family:verdana;font-size:10px;');
                    document.querySelector('body').append(solicitarA);
                    document.getElementById('solicitar_descontoA').addEventListener('click', () => {

                        document.getElementById('motivo_desconto').style.visibility = 'visible';
                        document.getElementById('nome_clienteD').style.visibility = 'visible';
                        document.getElementById('telefone_cliente').style.visibility = 'visible';
                        document.getElementById('email_cliente').style.visibility = 'visible';
                        document.getElementById('botaosolicitar').style.visibility = 'visible';
                        document.getElementById('tipo_objeto0').style.visibility = 'visible';
                        document.getElementById('tipo_objeto1').style.visibility = 'visible';
                        document.getElementById('tipo_objeto2').style.visibility = 'visible';
                        document.getElementById('tipo_objeto3').style.visibility = 'visible';
                        document.getElementById('tipo_objeto4').style.visibility = 'visible';
                        document.getElementById('tipo_objeto5').style.visibility = 'visible';
                        document.getElementById('cliente_titulo').style.visibility = 'visible';
                        document.getElementById('motivo_titulo').style.visibility = 'visible';
                        document.getElementById('telefone_titulo').style.visibility = 'visible';
                        document.getElementById('email_titulo').style.visibility = 'visible';
                        document.getElementById('desconto_titulo').style.visibility = 'visible';
                        document.getElementById('valor_desconto').style.visibility = 'visible';
                        document.getElementById('desconto_tituloo').style.visibility = 'visible';
                        document.getElementById('solicitar_descontoA').style.visibility = 'hidden';
                        document.getElementById('detalhet').style.visibility = 'visible';
                        document.getElementById('detalhe').style.visibility = 'visible';


                    })

                    /*campo = document.createElement('span');
                    campo.setAttribute('style', 'position:absolute;left:1100px;top:515px;color:navy;font-size:12px;font-family:verdana;width:22ch');
                    campo.innerHTML = '<b>Solicitar Desconto</b>:';
                    campo.setAttribute('id', 'solicita_tilo');
                    document.querySelector('body').append(campo); */

                    campo = document.createElement('span');
                    campo.setAttribute('id', 'tipo_objeto0')
                    campo.setAttribute('style', 'position:absolute;left:1000px;top:515px;font-family:verdana;font-size:12px;color:navy;visibility:hidden');
                    campo.innerText = 'Desconto';
                    document.body.append(campo)

                    campo = document.createElement('input');
                    campo.setAttribute('id', 'tipo_objeto1')
                    campo.setAttribute('type', 'radio');
                    campo.setAttribute('style', 'position:absolute;left:1060px;top:515px;visibility:hidden');
                    campo.setAttribute('name', 'tipo_objeto')
                    campo.setAttribute('value', 'desconto');
                    document.body.append(campo);

                    campo = document.createElement('span');
                    campo.setAttribute('id', 'tipo_objeto2')
                    campo.setAttribute('style', 'position:absolute;left:1090px;top:515px;font-family:verdana;font-size:12px;color:navy;visibility:hidden');
                    campo.innerText = 'Anulação';
                    document.body.append(campo)

                    campo = document.createElement('input');
                    campo.setAttribute('id', 'tipo_objeto3')
                    campo.setAttribute('type', 'radio');
                    campo.setAttribute('style', 'position:absolute;left:1150px;top:515px;visibility:hidden');
                    campo.setAttribute('name', 'tipo_objeto')
                    campo.setAttribute('value', 'anulação');
                    document.body.append(campo);

                    campo = document.createElement('span');
                    campo.setAttribute('id', 'tipo_objeto4')
                    campo.setAttribute('style', 'position:absolute;left:1180px;top:515px;font-family:verdana;font-size:12px;color:navy;visibility:hidden');
                    campo.innerText = 'Substituição';
                    document.body.append(campo)

                    campo = document.createElement('input');
                    campo.setAttribute('id', 'tipo_objeto5')
                    campo.setAttribute('type', 'radio');
                    campo.setAttribute('style', 'position:absolute;left:1260px;top:515px;visibility:hidden');
                    campo.setAttribute('name', 'tipo_objeto')
                    campo.setAttribute('value', 'substituição');
                    document.body.append(campo);

                    campo = document.createElement('span');
                    campo.setAttribute('style', 'position:absolute;left:1020px;top:545px;color:black;font-size:12px;font-family:verdana;visibility:hidden');
                    campo.innerHTML = 'Data Solicitação:';
                    campo.setAttribute('id', 'data_titulo');
                    document.querySelector('body').append(campo);


                    campo = document.createElement('span')
                    campo.setAttribute('style', 'visibility:hidden;position:absolute;left:1020px;top:545px;color:black;font-size:12px;font-family:verdana')
                    campo.setAttribute('id', 'desconto_titulo');
                    campo.innerHTML = 'Valor:'
                    document.querySelector('body').append(campo);
                    campo = document.createElement('span');
                    campo.innerHTML = 'R$'
                    campo.setAttribute('id', 'desconto_tituloo')
                    campo.setAttribute('style', 'visibility:hidden;position:absolute;left:1140px;top:543px;font-family:verdana;font-size:12px;color:black')
                    document.querySelector('body').append(campo)
                    campo = document.createElement('input') //#valor_desconto
                    campo.setAttribute('type', 'number')
                    campo.setAttribute('id', 'valor_desconto');
                    campo.setAttribute('style', 'visibility:hidden;position:absolute;left:1160px;top:545px;color:black;font-size:12px;font-family:verdana;width:7ch')
                    document.querySelector('body').append(campo);

                    campo = document.createElement('input');
                    campo.setAttribute('style', 'visibility:hidden;position:absolute;left:1140px;top:545px;color:black;font-size:12px;font-family:verdana;width:20ch;border:0px');
                    var data = new Date();
                    data = data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear();
                    campo.value = data;
                    campo.setAttribute('id', 'data_solicitacao'); //#data_solicitacao
                    document.querySelector('body').append(campo);
                    document.getElementById('data_solicitacao').disabled = true;
                    campo = document.createElement('span');
                    campo.setAttribute('style', 'position:absolute;left:1020px;top:565px;color:black;font-size:12px;font-family:verdana');
                    campo.innerHTML = 'Motivo:';
                    campo.setAttribute('id', 'motivo_titulo');
                    document.querySelector('body').append(campo);

                    /*campo = document.createElement('input')
                    campo.setAttribute('id', 'motivo_desconto') //#motivo_desconto
                    campo.setAttribute('style', 'position:absolute;left:920px;top:170px;color:black;font-size:12px;font-family:verdana;width:20ch')
                    document.querySelector('body').append(campo);*/

                    motivos_campo = document.createElement('select');
                    motivos_campo.setAttribute('style', 'position:absolute;left:1140px;top:565px;color:black;font-size:10px;font-family:verdana;width:24ch;border:1px solid lightgrey');
                    motivos_campo.setAttribute('id', 'motivo_desconto');
                    motivos = ['1-CADASTRO DE CLIENTE INCORRETO Alterou de alguma forma o frete (ICMS, cobrança TDE, taxas)', '2-COBRANÇA TAXA INDEVIDA Cobrado taxas indevidas ( tas, TDE, ICMS, TAD)', '3-MERCADORIA DE USO UND PROPRIA/PARCEIRA  Não linhou a cortesia e cobrou frete / Não emitiram cortesia', '4-REVERSÃO DE FRETE / ALTERA TABELA Emitiu NF tomador incorreto, reverteu, porém, solicita desconto de acordo com tabela', '5-ERRO DO CLIENTE  EMISSAO NF   Cliente emitiu NF errada na qual interferiu no frete ( Valor, peso / inscrição / cidade )', '6-ERRO DO CLIENTE AO ENVIAR ARQUIVO EDI    Enviou arquivo errado para a carvalima', '7-REAJUSTE INDEVIDO   Matriz reajustou indevido / Cliente de outro grupo / Não passado para cliente especial', '8-COTACAO NÃO ACATADA POR DIVERGENCIA / NÃO CONTRATADA    Alterou os dados, cliente de recusa pagar / Alterou dados, não foi alterado / Cotação não foi contratada /', '9-DUPLICIDADE EMISSAO COM A MESMA NF  Há mais de uma emissão com a mesma NF', '10-FALTA / ERRO DE AGRUPAMENTO NF  Não agrupou as Nfs no CTRC ( mesmo CNPJ remet/desti , coleta do mesmo dia, mesma cidade destino)', '11-EMISSAO REMET/ DEST/TOMADOR INCORRETO/ DADOS DIVERGENTE  Tomador incorreto na emissão / Dados divergente ( peso, NF, cidade), não seguiu a NF', '12-NAO RESPEITOU MENSAGEM DE TELA   Havia alguma particulidade com o cliente e não foi acatado', '13-PESO / CUBAGEM INCORRETO EMISSAO   Emitido com peso errado / Cubagem lançada manual errada (enviar fotos comprovando)', '14-COTACAO NAO ACATADA NA EMISSAO Cotação contratada, porém, não acatada', '15-EMISSAO FORA TABELA /TRANS/DEVOL   Emitido no Fob Dirigido / Promocional / Generica e não foi acatada a tabela do cliente tomador', '16-ATRASO NO CADASTRO DA TABELA   Matriz não cadastrou no periodo de 48 horas', '17-TABELA CADASTRADA ERRADA  Erro no cadastro da tabela no sistema', '18-FALHA DO SISTEMA SSW  TI    SSW calculou errado / Puxou alguma taxa indevida / Erro no arquivo enviado pelo cliente', '19-FALHA FORMALIZAÇÃO DA TABELA  Supervisão / Matriz confecionou a tabela errada', '20-ATRASO/ PROBLEMA COLETA/ ENTREGA  Cliente solicita desconto devido a atraso na coleta / entrega', '21-SEM CARIMBO EXPRESS    Motorista não carimbou EXPRESS na declaração (enviar fotos comprovando)', '22-PROMOCIONAL COM RECUSA    Cliente se recusa em pagar, alegando valor alto (seguir o manual promocional)', '23-CÓDIGO INCORRETO NA EMISSÃO / Cliente possui tabela em outro código / outro serviço', '24-OUTROS  DETALHE Caso não se enquandre em uns dos motivos acima, detalhe o motivo do seu desconto'];
                    motiv = document.createElement('option');
                    motiv.text = '';
                    motivos_campo.appendChild(motiv);
                    for (i = 0; i < motivos.length; i++) {
                        motiv = document.createElement('option');
                        motiv.text = motivos[i];
                        motivos_campo.appendChild(motiv);
                    }
                    document.querySelector('body').append(motivos_campo);
                    document.getElementById('motivo_desconto').addEventListener('change', () => {
                        if (document.getElementById('motivo_desconto').value == '25-OUTROS DETALHE Caso não se enquandre em uns dos motivos acima, detalhe o motivo do seu desconto') {
                            campo = document.createElement('input');
                            campo.setAttribute('style', 'left:1300px;top:565px;width:20ch;font-family:verdana;font-size:12px;color:black');
                            campo.setAttribute('placeholder', 'Qual outro motivo?...')
                            document.getElementById('motivo_desconto').id = 'ex_motivo_desconto';
                            campo.setAttribute('id', 'motivo_desconto');
                            document.querySelector('body').append(campo);
                        } else {
                            if (document.getElementById('ex_motivo_desconto')) {
                                document.getElementById('motivo_desconto').style.visibility = 'hidden';
                                document.getElementById('motivo_desconto').id = 'nenhum';
                                document.getElementById('ex_motivo_desconto').id = 'motivo_desconto';
                            }
                        }
                    });

                    campo = document.createElement('span')
                    campo.setAttribute('style', 'position:absolute;left:1020px;top:585px;color:black;font-size:12px;font-family:verdana')
                    campo.innerHTML = 'Nome Cliente:'
                    campo.setAttribute('id', 'cliente_titulo');
                    document.querySelector('body').append(campo);
                    campo = document.createElement('input');
                    campo.setAttribute('id', 'nome_clienteD'); //#nome_cliente
                    campo.setAttribute('style', 'position:absolute;left:1140px;top:585px;color:black;font-size:12px;font-family:verdana;width:20ch')
                    document.querySelector('body').append(campo);
                    campo = document.createElement('span')
                    campo.setAttribute('style', 'position:absolute;left:1020px;top:605px;color:black;font-size:12px;font-family:verdana')
                    campo.innerHTML = 'Telefone Cliente:';
                    campo.setAttribute('id', 'telefone_titulo');
                    document.querySelector('body').append(campo);
                    campo = document.createElement('input')
                    campo.setAttribute('id', 'telefone_cliente') //#telefone_cliente
                    campo.setAttribute('style', 'position:absolute;left:1140px;top:605px;color:black;font-size:12px;font-family:verdana;width:20ch')
                    document.querySelector('body').append(campo);
                    campo = document.createElement('span')
                    campo.setAttribute('style', 'position:absolute;left:1020px;top:625px;color:black;font-size:12px;font-family:verdana')
                    campo.innerHTML = 'E-mail Cliente:';
                    campo.setAttribute('id', 'email_titulo');
                    document.querySelector('body').append(campo);
                    campo = document.createElement('input')
                    campo.setAttribute('id', 'email_cliente'); //#email_cliente
                    campo.setAttribute('style', 'position:absolute;left:1140px;top:625px;color:black;font-size:12px;font-family:verdana;width:20ch')
                    document.querySelector('body').append(campo);

                    detalhec = document.createElement('input');
                    detalhec.setAttribute('id', 'detalhe');
                    detalhec.setAttribute('style', 'position:absolute;left:1140px;top:645px;color:black;font-size:12px;font-family:verdana;width:20ch;visibility:hidden;');
                    document.querySelector('body').append(detalhec);
                    detalhet = document.createElement('span');
                    detalhet.setAttribute('id', 'detalhet');
                    detalhet.setAttribute('style', 'position:absolute;left:1020px;top:645px;color:black;font-size:12px;font-family:verdana;visibility:hidden');
                    detalhet.innerText = 'Detalhes:';
                    document.querySelector('body').append(detalhet);
                    campo = document.createElement('a');
                    campo.setAttribute('href', '#');
                    campo.text = 'Solicitar'
                    campo.setAttribute('id', 'botaosolicitar')
                    campo.setAttribute('style', 'font-family:verdana;font-size:12px;color:navy;top:665px;left:1181px;padding:1px;')
                    document.querySelector('body').append(campo);
                    document.getElementById('botaosolicitar').addEventListener('mouseover', () => {
                        document.getElementById('botaosolicitar').style.color = 'red';
                    });
                    document.getElementById('botaosolicitar').addEventListener('mouseout', () => {
                        document.getElementById('botaosolicitar').style.color = 'navy';
                    });
                    document.getElementById('botaosolicitar').addEventListener('click', () => {
                        ctrcfatura = document.getElementsByClassName('data')[2].innerText
                        email_cliente = document.getElementById('email_cliente').value;
                        telefone_cliente = document.getElementById('telefone_cliente').value;
                        nome_clienteD = document.getElementById('nome_clienteD').value;
                        motivo_desconto = document.getElementById('motivo_desconto').value;
                        data_solicitacao = document.getElementById('data_solicitacao').value;
                        usuario_solicitante = getCookie('login');
                        valor_frete = document.getElementsByClassName('data')[24].innerText
                        nome_pagador = document.getElementsByClassName('data')[53].innerText
                        cnpj_pagador = document.getElementById('link_cli_pag').innerText
                        valor_desconto = document.getElementById('valor_desconto').value;
                        detalhe = document.getElementById('detalhe').value;
                        unidade_usuario = document.getElementsByTagName('b')[21].innerText.substring(0,4).trim();
                        
                        if(document.getElementsByName('tipo_objeto')[0].checked){
                            tipo_objeto = 'Desconto';
                        }else if(document.getElementsByName('tipo_objeto')[1].checked){
                            tipo_objeto = 'Anulação';
                        }else if(document.getElementsByName('tipo_objeto')[2].checked){
                            tipo_objeto = 'Substituição';
                        }else{
                            tipo_objeto = '';
                        }

                        if (valor_desconto == '' || data_solicitacao == '' || motivo_desconto == '' || nome_clienteD == '' || telefone_cliente == '' || email_cliente == '' || ctrcfatura == '' || tipo_objeto == '') {
                            alert('Preencha todos os campos.')
                        } else {
                            obj = {
                                valor_desconto: valor_desconto,
                                valor_frete: valor_frete,
                                nome_pagador: nome_pagador,
                                cnpj_pagador: cnpj_pagador,
                                usuario_solicitante: usuario_solicitante,
                                descontoacao: 'solicita2',
                                ctrcfatura: ctrcfatura,
                                status: 'solicitado',
                                email_cliente: email_cliente,
                                telefone_cliente: telefone_cliente,
                                nome_clienteD: nome_clienteD,
                                motivo_desconto: motivo_desconto,
                                data_solicitacao: data_solicitacao,
                                detalhe: detalhe,
                                tipo: tipo_objeto,
                                unidade_usuario: unidade_usuario
                            }
                            console.log(obj)
                            salva_bd(obj, 'desconto');
                            alert('Solicitado com sucesso.')
                            setCookie('attm', 'atualizar', 365);
                            setTimeout(function() {
                                window.close();
                            }, 2500);
                        }

                    });
                    document.getElementById('data_solicitacao').style.visibility = 'hidden';
                    document.getElementById('motivo_desconto').style.visibility = 'hidden';
                    document.getElementById('nome_clienteD').style.visibility = 'hidden';
                    document.getElementById('telefone_cliente').style.visibility = 'hidden';
                    document.getElementById('email_cliente').style.visibility = 'hidden';
                    document.getElementById('botaosolicitar').style.visibility = 'hidden';
                    
                    document.getElementById('data_titulo').style.visibility = 'hidden';
                    document.getElementById('cliente_titulo').style.visibility = 'hidden';
                    document.getElementById('motivo_titulo').style.visibility = 'hidden';
                    document.getElementById('telefone_titulo').style.visibility = 'hidden';
                    document.getElementById('desconto_tituloo').style.visibility = 'hidden';
                    document.getElementById('email_titulo').style.visibility = 'hidden';
                    document.getElementById('detalhet').style.visibility = 'hidden';
                    document.getElementById('detalhe').style.visibility = 'hidden';


                }
            }
        }

        ctrcfatura = document.getElementsByClassName('data')[2].innerText
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=desconto&descontoacao=exibe&ctrcfatura=" + ctrcfatura, true);
        xmlhttp.send();
    }

    function op101_cte() {

        document.getElementById('t_ser_ctrc').addEventListener('paste', (e) => { //altera o ctrl+v do campo de CTe
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            if (pastedData.length == 9) {
                var letras = pastedData.substr(0, 3);
                var numeros = pastedData.substr(3);
                document.getElementById('t_ser_ctrc').value = letras;
                document.getElementById('t_nro_ctrc').value = numeros;
            } else {
                document.getElementById('t_nro_ctrc').value = pastedData
            }
        });
        document.getElementById('t_nro_ctrc').addEventListener('paste', (e) => { //altera o ctrl+v do campo de CTe
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            if (pastedData.length == 9) {
                var letras = pastedData.substr(0, 3);
                var numeros = pastedData.substr(3);
                document.getElementById('t_ser_ctrc').value = letras;
                document.getElementById('t_nro_ctrc').value = numeros;
            } else {
                document.getElementById('t_nro_ctrc').value = pastedData
            }
        });

    }

    function op457_cnpj() {
        document.getElementById('t_cnpj_finan').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('t_cnpj_finan').value = pastedData;
        });
        document.getElementById('t_cnpj_sacado').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('t_cnpj_sacado').value = pastedData;
        });
        document.getElementById('t_cnpj_grupo').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('t_cnpj_grupo').value = pastedData;
        });

    }

    function op103_cnpj() {

        document.getElementById('23').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('23').value = pastedData;
        });
        document.getElementById('27').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('27').value = pastedData;
        });
        document.getElementById('47').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('47').value = pastedData;
        });

    }

    function op002_andamento() { //Exibe uma tabela com as cotações salvas pelo usuário (botão acompanhar/em andamento)

        document.getElementById('16').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('16').value = pastedData;
        });

        function rmvnuM(id) {
            alvo = id.substr(1);
            resultado = document.getElementById('num' + alvo).innerHTML;
            alert(resultado);
        }

        usuario = getCookie('login');
        node = document.createElement("div");
        node.setAttribute("id", "divTabela");
        node.setAttribute("style", "left:100px; top:336px;text-align:left;");
        document.getElementById("frm").appendChild(node);

        node2 = document.createElement("table");
        node2.setAttribute("id", "tabela");
        node2.setAttribute("class", "srdiv");
        node2.setAttribute("style", "table-layout: fixed;");
        node.appendChild(node2);

        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                estilo = ' style="cursor: pointer; background: rgb(255, 255, 255); position: relative; text-decoration: none;" ';
                myObj = this.responseText;

                x = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
                html = '';
                html += '<tr class="srtr2" style="cursor: default;">';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Pagador</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">N° Cotação</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Observação</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Remover</a></div></td>';
                html += '</tr>';
                totalNum = x.length;
                for (var i = 0; i < x.length; i++) {
                    console.log(x.length);
                    console.log(i);
                    html += '<tr class="srtr2" style="cursor:pointer">';
                    html += '<td class="srtd2"><div id="o' + i + '" class="srdvl">' + x[i].nome + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl" id="num' + i + '">' + x[i].numero + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl">' + x[i].obs + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl"><a href="#" id="n' + i + '" class="imglnk remover" title="Remover" style="position:relative;">&nbsp;×&nbsp;</a></div></td>';
                    html += '</tr>';
                }
                document.getElementById('tabela').innerHTML = html;

                for (i = 0; i < totalNum; i++) { //arma todos os botões remover da tabela
                    document.getElementById('n' + i).addEventListener('click', function(event) {
                        numeroARemover = document.getElementById('num' + event.target.id.substr(1)).innerHTML
                        usuario = getCookie('login')
                        obj = {
                            numero: numeroARemover,
                            usuario: usuario
                        }
                        salva_bd(obj, 'rem_op002');
                        location.reload();
                    });
                    document.getElementById('o' + i).addEventListener('click', function(event) {
                        numeroAbre = document.getElementById('num' + event.target.id.substr(1)).innerHTML
                        document.getElementById('3').value = numeroAbre;
                        document.getElementById('4').click();
                    });
                    document.getElementById('num' + i).addEventListener('click', function(event) {
                        numeroClica = document.getElementById('num' + event.target.id.substr(3)).innerHTML;
                        usuario = getCookie('login');
                        document.getElementById('3').value = numeroClica;
                        document.getElementById('4').click();
                    });
                }
            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=op002_andamento&usuario=" + usuario, true);
        xmlhttp.send();
        setInterval(function() {
            if (getCookie('attm') == 'atualizar') {
                location.reload();
                setCookie('attm', '', -2);
            }
        }, 1500)
    }


    function op102_analise() { //ANÁLISES DE CRÉDITO
        setInterval(function() {
            if (getCookie("clicar") == "ocorrencia") {              //abre automaticamente a tela de ocorrência caso haja cookie "ocorrencia"
                document.getElementById('link_ocor').click();
                setCookie("clicar", "", -2);
            }
        }, 500)

        telap = document.getElementById("telaprog").textContent.substring(0, 10).trim();
        if (telap == "ssw0840.02") { // NA TELA DE OCORRÊNCIA, EXIBE ()APROVAR ()REPROVAR
            grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
            if (grupo == '43' || grupo == '52' || grupo == '7' || grupo == '07' || grupo == '18' || usuario == 'jheniffe') { //e se o grupo for o financeiro (43)
                //DIMINUI O TAMANHO DOS INPUTS ORIGINAIS
                document.getElementById('1').style.width = '670px'
                document.getElementById('1').setAttribute('maxlength', '100')
                document.getElementById('2').style.width = '670px'
                document.getElementById('2').setAttribute('maxlength', '100')
                document.getElementById('3').style.width = '670px'
                document.getElementById('3').setAttribute('maxlength', '100')

                                 //EXIBE O TÍTULO "ANÁLISE DE CRÉDITO"
                analise_titulo = document.createElement('div');
                analise_titulo.setAttribute('style', 'left:840px;top:93px;font-family:verdana;');
                analise_titulo.innerHTML = '<b>Análise de Crédito:</b>';
                document.getElementById('frm').append(analise_titulo);

                cnpj = document.getElementsByClassName('data')[0].innerText;

                date = new Date();

                hoje = date.getDate() + "/" + (date.getMonth()+1)

                xmlhttp = new XMLHttpRequest(); //BUSCA NO BD E EXIBE O QUE FOR APROPRIADO AO STATUS DA SOLICITAÇÃO DE CRÉDITO                         
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        myObj = this.responseText;
                        x = JSON.parse(myObj);
                        if (x.length > 0) { //SE O REGISTRO EXISTIR NO BD: EXIBE:
                            if (x[0].status == 'Em análise') {
                                //STATUS: EM ANÁLISE


                                //RADIO APROVADO
                                radioAprovado = document.createElement('input')
                                radioAprovado.setAttribute('type', 'radio');
                                radioAprovado.setAttribute('name', 'analise');
                                radioAprovado.setAttribute('id', 'radioAprovado');
                                radioAprovado.setAttribute('value', 'aprovado');
                                radioAprovado.setAttribute('style', 'left:860px;top:110px;')
                                document.getElementById('frm').append(radioAprovado)

                                radioApr = document.createElement('div');
                                radioApr.innerHTML = "Aprovar";
                                radioApr.setAttribute('id', 'radioApr');
                                radioApr.setAttribute('style', 'left:880px;top:110px;font-family:verdana;');
                                document.getElementById('frm').append(radioApr);

                                //RADIO REPROVADO
                                radioReprovado = document.createElement('input')
                                radioReprovado.setAttribute('type', 'radio');
                                radioReprovado.setAttribute('id', 'radioReprovado');
                                radioReprovado.setAttribute('name', 'analise');
                                radioReprovado.setAttribute('value', 'reprovado');
                                radioReprovado.setAttribute('style', 'left:860px;top:130px;')
                                document.getElementById('frm').append(radioReprovado)
                                document.getElementById('radioAprovado').checked = true
                                radioRepr = document.createElement('div');
                                radioRepr.innerHTML = "Reprovar";
                                radioApr.setAttribute('id', 'radioRepr');
                                radioRepr.setAttribute('style', 'left:880px;top:130px;font-family:verdana;')
                                document.getElementById('frm').append(radioRepr)

                                //BOTÃO ATUALIZA STATUS
                                aprova_reprova = document.createElement('a');
                                aprova_reprova.setAttribute('style', 'left:890px;top:150px;font-family:verdana;font-size:12px;color:blue;text-decoration:none');
                                aprova_reprova.setAttribute('href', '#');
                                aprova_reprova.setAttribute('id', 'aprova_reprova');
                                aprova_reprova.innerText = '►';
                                document.getElementById('frm').append(aprova_reprova);
                                document.getElementById('aprova_reprova').addEventListener('click', () => { //INICIO DO BOTÃO DE APROVAR OU REPROVAR
                                    cnpj = document.getElementsByClassName('data')[0].innerText;
                                    if (document.getElementById('radioReprovado').checked == true) { //SE "REPROVADO" ESTIVER MARCADO, PERGUNTA O MOTIVO
                                        document.getElementById('1').value = 'Motivo:';
                                        document.getElementById('2').style = 'visibility:hidden';
                                        document.getElementById('3').style = 'visibility:hidden';
                                        document.getElementById('4').style = 'visibility:hidden';
                                        document.getElementById('5').style = 'visibility:hidden';
                                        document.getElementById('aprova_reprova').style = 'visibility:hidden';
                                        document.getElementById('radioAprovado').style = 'visibility:hidden';
                                        //document.getElementById('radioApr').style = 'visibility:hidden';
                                        neoaprova_reprova = document.createElement('a');
                                        neoaprova_reprova.setAttribute('style', 'left:890px;top:155px;font-family:verdana;font-size:12px;color:red;text-decoration:none');
                                        neoaprova_reprova.setAttribute('href', '#');
                                        neoaprova_reprova.setAttribute('id', 'neoaprova_reprova');
                                        neoaprova_reprova.innerText = '►';
                                        document.body.append(neoaprova_reprova);
                                        document.getElementById('neoaprova_reprova').addEventListener('click', () => {  //NOVO BOTÃO ATUALIZA STATUS APÓS REPROVADO 1/2
                                            setCookie("attm", "atualizar", 1);
                                            estado = 'Reprovado.';
                                            cnpj = document.getElementsByClassName('data')[0].innerText;
                                            motivo = document.getElementById('1').value;
                                            var data = new Date();
                                            var data = data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes();
                                            obj = {
                                                cnpj: cnpj,
                                                status: estado,
                                                dest: motivo,
                                                desde: data
                                            }
                                            salva_bd(obj, 'credito_update')

                                            obj ={
                                                usuario: getCookie('login'),
                                                data: data,
                                                ocorrencia: motivo,
                                                cte: cnpj
                                            }
                                            salva_bd(obj, '101_ocorrencia');    

                                            document.getElementById('4').click();
                                            alert('Crédito recusado.')
                                        });
                                    } else if(document.getElementById('radioAprovado').checked == true) { //STATUS: APROVADO (1/2)
                                        
                                        document.getElementById('1').value = 'Crédito Aprovado.';
                                        document.getElementById('2').style = 'visibility:hidden';
                                        document.getElementById('3').style = 'visibility:hidden';
                                        document.getElementById('4').style = 'visibility:hidden';
                                        document.getElementById('5').style = 'visibility:hidden';
                                        document.getElementById('aprova_reprova').style = 'visibility:hidden';
                                        document.getElementById('radioReprovado').style = 'visibility:hidden';
                                        //document.getElementById('radioApr').style = 'visibility:hidden';
                                        neoaprova_reprova = document.createElement('a');
                                        neoaprova_reprova.setAttribute('style', 'left:890px;top:155px;font-family:verdana;font-size:12px;color:red;text-decoration:none');
                                        neoaprova_reprova.setAttribute('href', '#');
                                        neoaprova_reprova.setAttribute('id', 'neoaprova_reprova');
                                        neoaprova_reprova.innerText = '►';
                                        document.body.append(neoaprova_reprova);
                                        document.getElementById('neoaprova_reprova').addEventListener('click', () => { //NOVO BOTÃO 2/2 APROVADO
                                            setCookie("attm", "atualizar", 1);
                                            estado = 'Aprovado.';
                                            cnpj = document.getElementsByClassName('data')[0].innerText;
                                            motivo = document.getElementById('1').value;
                                            var data = new Date();
                                            var data = data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes();
                                            obj = {
                                                cnpj: cnpj,
                                                status: estado,
                                                dest: motivo,
                                                desde: data
                                            }
                                            salva_bd(obj, 'credito_update')
                                            obj ={
                                                usuario: getCookie('login'),
                                                data: data,
                                                ocorrencia: motivo,
                                                cte: cnpj
                                            }
                                            salva_bd(obj, '101_ocorrencia');
                                            
                                            document.getElementById('4').click();
                                            alert('Crédito aprovado.')

                                            setTimeout(function() {
                                                window.close();
                                            }, 3500)
                                        });//FIM DO NEO-BOTÃO APROVADO
                                    }//fim do botão aprovado
                                });//fim do botão 1/2
                            }//fim da iteração do EM ANÁLISE
                        }//fim da iteração caso HAJA ALGUM REGISTRO NO BD
                    }//fim da iteração caso HAJA ALGUMA RESPOSTA 200 DO BD
                }//fim do xml http
                xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=credito_analise&cnpj=" + cnpj + "&hoje=" + hoje, true);
                xmlhttp.send();
            } //fim da iteração dos grupos e usuários da aprovação/reprovação de crédito
        } else { //se for a tela da SITUAÇÃO DE CLIENTE
            var analise = document.createElement('a');
            analise.setAttribute('style', 'left:880px;top:192px;');
            analise.setAttribute('href', '#');
            analise.innerHTML = 'Análise de Crédito';
            analise.setAttribute('id', 'linkanalise');
            document.getElementById('frm').append(analise);
            document.getElementById('linkanalise').addEventListener('mouseover', () => {
                document.getElementById('linkanalise').style.color = 'red';
            });
            document.getElementById('linkanalise').addEventListener('mouseout', () => {
                document.getElementById('linkanalise').style.color = 'navy';
            });
            document.getElementById('linkanalise').addEventListener('click', () => {

                var cnpjcpf = document.getElementsByClassName('data')[0].innerText;
                var cliente = document.getElementsByClassName('data')[3].innerText;
                var status = 'Em análise';
                var usuario = getCookie('login');
                var dominio = document.getElementsByClassName("texto3")[0].innerText.substring(8, document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
                var identificador = 'credito';
                var unid = document.getElementsByClassName('data')[18].innerText;
                var data = new Date();
                var data = data.getDate() + "/" + (data.getMonth() + 1) + "/" + data.getFullYear() + " " + data.getHours() + ":" + data.getMinutes();
                console.log(data);
                obj = {
                    cte: cnpjcpf,
                    rem: cliente,
                    dest: '',
                    status: status,
                    usuario: usuario,
                    dominio: dominio,
                    identificador: identificador,
                    desde: data,
                    unid: unid
                }
                setCookie("attm", "atualizar", 1);
                salva_bd(obj, 'credito');
                alert('Solicitação realizada com sucesso!')
                setTimeout(function() {
                    window.close();
                }, 2000);
            });
        }
    }

    function op457() { //NOVOS CAMPOS NA OPÇÃO 457

        incluso = document.createElement('span');
        incluso.setAttribute('style', 'position:absolute;left:27px;top:206px;font-family:verdana;font-size:10px;');
        incluso.innerHTML = 'Pagamento Programado.';
        document.body.append(incluso);

        incluso = document.createElement('input');
        incluso.setAttribute('type', 'checkbox')
        incluso.setAttribute('style', 'position:absolute;left:10px;top:206px;');
        incluso.setAttribute('id', 'programado');
        document.body.append(incluso);

        incluso = document.createElement('span');
        incluso.setAttribute('style', 'position:absolute;left:27px;top:224px;font-family:verdana;font-size:10px;');
        incluso.innerHTML = "Enviado relatório de ctrcs/faturas pendentes aos e-mails cadastrados.";
        document.body.append(incluso);

        incluso = document.createElement('input');
        incluso.setAttribute('type', 'checkbox');
        incluso.setAttribute('style', 'position:absolute;left:10px;top:224px;');
        incluso.setAttribute('id', 'enviado');
        document.body.append(incluso);

        

        document.getElementsByClassName('texto')[1].innerText = 'Texto';
        document.getElementsByClassName('texto')[1].style.top = '188px';
        document.getElementsByClassName('texto')[1].style.left = '2px';


        setInterval(() => {
            if (document.getElementById('stat').value == '') {
                document.getElementById('2').style.visibility = 'hidden';
            } else {
                document.getElementById('2').style.visibility = 'visible';
            }
        }, 100);
        document.getElementById('1').style.top = "190px";
        document.getElementById('1').style.left = "131px";
        document.getElementById('2').style.top = "190px";
        document.getElementById('2').style.left = "640px";
        document.getElementById('3').style.top = "190px";
        document.getElementById('3').style.left = "620px";


        var local = 'left:606px top:30px';
        novo = crEl('div', 'carteira', 'Carteira cobrança:', 'texto', 'left:16px;top:120px;') //carteira cobrança
        document.getElementById('frm').append(novo);
        novo = crEl('input', 'carteira_campo', '', '', 'left:131px;top:120px;width:405px');
        document.getElementById('frm').append(novo);
        novo = crEl('div', 'acaoT', 'Ação:', 'texto', 'left:16px;top:136px;') //ação realizada:
        document.getElementById('frm').append(novo);
        novo = document.createElement('select');
        novo.setAttribute('id', 'acao');
        novo.setAttribute('style', 'left:131px;top:134px;border:1px solid lightgrey;');
        opcao = document.createElement('option');
        opcao.text = ' ';
        novo.appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'Primeira ação.';
        novo.appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'Segunda ação.';
        novo.appendChild(opcao);
        opcao = document.createElement('option');
        opcao.text = 'Terceira ação.';
        novo.appendChild(opcao);
        document.getElementById('frm').append(novo);


        novo = crEl('div', 'stats', 'Status da Ação:', 'texto', 'left:14px;top:152px') //Status da Ação
        document.getElementById('frm').append(novo)
        stat = document.createElement('select');
        stat.setAttribute('id', 'stat');
        stat.style = 'left: 131px; top: 152px;border:1px solid lightgrey;font-size:12px;color:blue;width:405px;';
        statOps = ['Recebido comprovante de pagamento, direcionado para liquidação', 'Cliente sem interesse de negociação com CVL, direcionado para assessoria jurídica', 'Frete recebido no ato de entrega', 'Não conseguiu realizar contato - fone não atende, e-mail enviado', 'Sem dados cadastrais (fone/e-mail)', 'Responsável ausente', 'Envio de dacte para análise e programação', 'Divergência de pagador', 'Desacordo comercial - valor do frete', 'Alteração unid. responsável', 'Processo de indenização', 'Cliente informou que efetuou o pagamento, aguardando comprovante...', 'CTRC ANULACAO verificando com setor fiscal'];
        var statOp = document.createElement('option');
        statOp.text = "";
        stat.appendChild(statOp);
        for (i = 0; i < statOps.length; i++) {
            var statOp = document.createElement('option');
            statOp.text = statOps[i];
            stat.appendChild(statOp);
        }
        document.getElementById('frm').appendChild(stat);

        /*novo = crEl('div', 'programacao', 'Ação realizada em:', 'texto', 'left:16px;top:191px')       //Programação de pagamento
        document.getElementById('frm').append(novo);
        novo = document.createElement('input');
        novo.setAttribute('type', 'date');
        novo.setAttribute('id', 'programacao_campo');
        novo.style='left:131px;top:191px;'
        document.getElementById('frm').append(novo);*/

        novo = crEl('div', 'clientepg', 'Cliente pagador:', 'texto', 'left:16px;top:170px;') //Cliente pagador
        document.getElementById('frm').append(novo);
        novo = crEl('input', 'clientepg_campo', '', '', 'left:131px;top:173px;width:405px');
        document.getElementById('frm').append(novo)


        var numero = document.getElementsByClassName('data')[0].innerText; //numero
        nome_carteira = getCookie('nome_carteira');
        document.getElementById('carteira_campo').disabled = true;
        document.getElementById('carteira_campo').value = nome_carteira;
        document.getElementById('carteira_campo').style.border = '0px';


        nome_Cliente = getCookie('nome_Cliente');
        document.getElementById('clientepg_campo').value = nome_Cliente;
        document.getElementById('clientepg_campo').disabled = true;
        document.getElementById('clientepg_campo').style.border = '0px';
        document.getElementById('stat').style.top = '154px';

        xmlhttp = new XMLHttpRequest(); //Exibe os valores que estão salvos no bd
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                myObj = this.responseText;
                x = JSON.parse(myObj);
                if (x.length > 0) {
                    document.getElementById('carteira_campo').value = x[0].carteira;
                    document.getElementById('carteira_campo').disabled = true;
                    document.getElementById('carteira_campo').style.border = '0px'
                    document.getElementById('stat').value = x[0].status;
                    document.getElementById('clientepg_campo').value = x[0].cliente
                    document.getElementById('clientepg_campo').disabled = true;
                    document.getElementById('clientepg_campo').style.border = '0px';
                }
            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=op104_busca&numero=" + numero, true);
        xmlhttp.send();


        document.getElementById('2').addEventListener('click', (e) => {

            if (document.getElementById('1').value == '') {
                document.getElementById('1').value = '.';
            }


            var usuario = getCookie('login'); //usuario
            var data1 = '';
            var data2 = '';
            var data3 = '';
            if(document.getElementById('enviado').checked==true){
                enviado= "ENVIADO RELATÓRIO DE CTRCS/FATURAS PENDENTES AOS E-MAILS CADASTRADOS"
            }else{enviado="";}
            if(document.getElementById('programado').checked==true){
                programado = "Pagamento programado.";
            }else{programado = "";}
            var texto = document.getElementById('1').value;
            document.getElementById('1').value = texto + ". "+ enviado + " " + programado;
            var valor_fatura = getCookie('valor_fatura'); //valor
            var bd = 'carteira, acao, status, programacao, cliente, numero'
            var numero = document.getElementsByClassName('data')[0].innerText; //numero
            var carteira = document.getElementById('carteira_campo').value; //carteira
            var statusacao = document.getElementById('stat').value; //status da ação
            var data = new Date();
            data = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate();
            var programacao = data; //isso aqui vai dar bo na leitura por conflito DATE/TEXT
            var cliente = document.getElementById('clientepg_campo').value; //cliente pagador
            var acao = document.getElementById('acao').value;
            var ocorrencia = '';
            if (statusacao == "" || texto == "") {
                alert("ERRO: É necessário preencher todos os campos.");
            } else {
                dados = {
                    data1: data1,
                    data2: data2,
                    data3: data3,
                    valor: valor_fatura,
                    usuario: usuario,
                    texto: texto,
                    carteira: carteira,
                    status: statusacao,
                    programacao: programacao,
                    cliente: cliente,
                    acao: acao,
                    numero: numero,
                }
                salva_bd(dados, 'op104_salva');

            }
        });

        //<a id="2" onfocus="obj=this;" style="left:544px; top:96px;" class="imglnk" href="#"
        // onclick="ajaxEnvia('G99', 0);return false;" accesskey="&amp;">&nbsp;►&nbsp;</a>
    }


    function op139() { //PESQUISA AMPLIADA DAS INFOS DE COLABORADORES, POSSUI UMA TABELA PRÓPRIA NO BD

        document.getElementById('12').style.top = '115px';

        usuario = getCookie('login');
        if (usuario == 'artur') {
            topp = 100;
            for (i = 1; i < 15; i++) {
                tit = document.createElement('div');
                tit.setAttribute('style', 'font-family:verdana;font-size:12px')
                tit.style.left = '590px';
                tit.style.top = topp + 'px';
                tit.setAttribute('id', 'titulo' + i);
                tit.hidden = true;
                document.body.append(tit);
                inp = document.createElement('input');
                inp.style.top = topp + 'px';
                inp.style.left = '700px'
                inp.setAttribute('id', "input" + i);
                inp.setAttribute('type', 'text');
                inp.hidden = true;
                document.body.append(inp);
                topp = topp + 20;
            }
            bot = document.createElement('button');
            bot.setAttribute('style', 'position:absolute;left:750px;font-family:verdana;font-size:12px');
            topp = topp + 10;
            bot.style.top = topp + "px";
            topp = topp + 20;
            bot.innerText = 'Salvar Dados';
            bot.setAttribute('id', 'salvar_dados');
            bot.hidden = true;
            document.getElementById('frm').append(bot);
            document.getElementById('salvar_dados').addEventListener('click', function(e){
                var titulo1 = document.getElementById('input1').value
                var titulo2 = document.getElementById('input2').value
                var titulo3 = document.getElementById('input3').value
                var titulo4 = document.getElementById('input4').value
                var titulo5 = document.getElementById('input5').value
                var titulo6 = document.getElementById('input6').value
                var titulo7 = document.getElementById('input7').value
                var titulo8 = document.getElementById('input8').value
                var titulo9 = document.getElementById('input9').value
                var titulo10 = document.getElementById('input10').value
                var titulo11 = document.getElementById('input11').value
                var titulo12 = document.getElementById('input12').value
                var titulo13 = document.getElementById('input13').value
                var titulo14 = document.getElementById('input14').value
                event.preventDefault()
                span = document.createElement('span')
                span.innerHTML = "('"+titulo1+"', '"+titulo2+"', '"+titulo3+"', '"+ titulo4+"', '"+ titulo5+"', '"+ titulo6+"', '"+ titulo7+"', '"+ titulo8+"', '"+ titulo9+"', '"+ titulo10+"', '"+ titulo11+"', '"+ titulo12+"', '"+ titulo13+"', '"+ titulo14+"'), "
                document.getElementById('querysql').append(span)
            })
            tit = document.createElement('div');
            tit.style.top = "80px"
            tit.style.left = "670px"
            tit.hidden = true;
            tit.innerText = 'Novo Registro'
            document.getElementById('frm').append(tit);
            var titulo = document.createElement('a');
            titulo.setAttribute('style', 'left:60px; top:140px;font-family:verdana;font-size:12px');
            titulo.innerHTML = '<b>Quem é Quem</b>';
            titulo.setAttribute('href', '#')
            titulo.setAttribute('id', 'titulo');
            document.getElementById('frm').append(titulo);
            document.getElementById('titulo').addEventListener('click', () => {
                exibe = document.createElement('div');
                exibe.setAttribute('id', 'querysql')
                exibe.innerHTML = 'insert into op139 (nome, unidade, cidade, departamento, funcao, telefone, email, ramal, grupo, skype, celular, endereco, cnpj, supervisor) values<br>';
                exibe.style.left = '700px';
                exibe.style.top = "420px";
                document.body.append(exibe);
                document.getElementById('input1').hidden = false;
                document.getElementById('input2').hidden = false;
                document.getElementById('input3').hidden = false;
                document.getElementById('input4').hidden = false;
                document.getElementById('input5').hidden = false;
                document.getElementById('input6').hidden = false;
                document.getElementById('input7').hidden = false;
                document.getElementById('input8').hidden = false;
                document.getElementById('input9').hidden = false;
                document.getElementById('input10').hidden = false;
                document.getElementById('input11').hidden = false;
                document.getElementById('input12').hidden = false;
                document.getElementById('input13').hidden = false;
                document.getElementById('input14').hidden = false;
                document.getElementById('salvar_dados').hidden = false;
                document.getElementById('titulo1').hidden = false;
                document.getElementById('titulo1').innerText = 'Nome Completo:';
                document.getElementById('titulo2').hidden = false;
                document.getElementById('titulo2').innerText = 'Unidade:';
                document.getElementById('titulo3').hidden = false;
                document.getElementById('titulo3').innerText = 'Cidade:';
                document.getElementById('titulo4').hidden = false;
                document.getElementById('titulo4').innerText = 'Departamento:';
                document.getElementById('titulo5').hidden = false;
                document.getElementById('titulo5').innerText = 'Função::';
                document.getElementById('titulo6').hidden = false;
                document.getElementById('titulo6').innerText = 'Telefone:';
                document.getElementById('titulo7').hidden = false;
                document.getElementById('titulo7').innerText = 'E-mail:';
                document.getElementById('titulo8').hidden = false;
                document.getElementById('titulo8').innerText = 'Ramal:';
                document.getElementById('titulo9').hidden = false;
                document.getElementById('titulo9').innerText = 'Grupo:';
                document.getElementById('titulo10').hidden = false;
                document.getElementById('titulo10').innerText = 'Skype:';
                document.getElementById('titulo11').hidden = false;
                document.getElementById('titulo11').innerText = 'Celular:';
                document.getElementById('titulo12').hidden = false;
                document.getElementById('titulo12').innerText = 'Endereço:';
                document.getElementById('titulo13').hidden = false;
                document.getElementById('titulo13').innerText = 'CNPJ:';
                document.getElementById('titulo14').hidden = false;
                document.getElementById('titulo14').innerText = 'Supervisor:';

            })

        } else {
            var titulo = document.createElement('div');
            titulo.setAttribute('style', 'left:60px; top:140px;font-family:verdana;font-size:12px');
            titulo.innerHTML = '<b>Quem é Quem</b>';
            document.getElementById('frm').append(titulo)
        }


        var etiqueta = document.createElement('p'); //"PESQUISAR"
        etiqueta.innerHTML = 'Pesquisar: ';
        etiqueta.setAttribute('style', 'position:absolute;font-family:verdana;font-size:10px;left:59px;top:162px;')

        var campo_novo = document.createElement('input'); //cria campo da pesquisa do Melhorias
        campo_novo.setAttribute('style', 'left: 120px; top: 164px; width: 240px; background: white;')
        campo_novo.setAttribute('id', 'campo_novo');

        var botao_novo = document.createElement('a'); //cria o botão da pesquisa do Melhorias
        var botao = document.createTextNode(" ► ");
        botao_novo.appendChild(botao);
        botao_novo.setAttribute('href', '#');
        botao_novo.setAttribute('id', 'botao_novo');
        botao_novo.style = 'left:368px;top:160px;';
        document.getElementById('frm').append(botao_novo);
        document.getElementById('frm').append(campo_novo);
        document.getElementById('frm').append(etiqueta);
        document.getElementById('botao_novo').style.textDecoration = 'none';
        document.getElementById('botao_novo').style.color = 'navy';
        document.getElementById('botao_novo').style.padding = '2px';
        document.getElementById('botao_novo').style.fontSize = '12px';
        document.getElementById('botao_novo').addEventListener('mouseover', () => {
            document.getElementById('botao_novo').style.color = 'red';
            document.getElementById('botao_novo').style.borderRight = '1px solid black'
            document.getElementById('botao_novo').style.borderBottom = '1px solid black'
        });
        document.getElementById('botao_novo').addEventListener('mouseout', () => {
            document.getElementById('botao_novo').style.color = 'navy';
            document.getElementById('botao_novo').style.borderRight = '0px';
            document.getElementById('botao_novo').style.borderBottom = '0px';
        });


        botao_novo.addEventListener('click', () => { //faz a busca e exibe o resultado ao clicar no novo botão
            var pesquisa = document.getElementById('campo_novo').value; //pega o .value da pesquisa
            document.getElementById('frm').innerHTML = ''; //some com o conteudo
            document.getElementById('procimg').style.visibility = 'visible'; //coloca na tela a imagem de 'loading...'

            xmlhttp = new XMLHttpRequest(); //XMLHttpRequest
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    myObj = this.responseText;
                    //console.log(myObj);
                    x = JSON.parse(myObj); //x[0].nome x[0].usuario
                    if (x.length > 0) {
                        var tabela = document.createElement('table'); //tabela no mesmo estilo do ssw convencional
                        tabela.setAttribute('id', 'tabelaPesquisa');
                        tabela.style.left = '0px';
                        tabela.style.top = '80px';
                        tabela.style.position = 'absolute' //cabeçalho da tabela de resultados
                        var texto = '<tr style="background:#1951B9;"><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>Setor</b></td><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>Função</b></td><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>Responsável</b></td><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>E-mail</b></td><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>Telefone</b></td><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>Ramal</b></td><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>Celular</b></td><td style="margin:0px;border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;color:white;padding:3px;"><b>Skype</b></td></tr>';
                        for (i = 0; i < x.length; i++) { //exibe os resultados
                            if (i % 2 == 0) {
                                texto += '<tr>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].unidade.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].funcao.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].nome.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].email + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].telefone + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].ramal.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].celular + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].skype + '</td>';
                                texto += '</tr>';
                            } else {
                                texto += '<tr style="background:#dddddd">';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].unidade.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].funcao.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].nome.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].email + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].telefone + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].ramal.toUpperCase() + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].celular + '</td>';
                                texto += '<td style="border-right:1px solid #c1c1c1;border-bottom:1px solid #c1c1c1;">' + x[i].skype + '</td>';
                                texto += '</tr>';

                            }
                        }
                        tabela.innerHTML = texto; //insere o HTML com todos os resultados anteriores na tabela
                        document.getElementById('procimg').style.visibility = 'hidden'; //faz sumir o 'loading...'
                        document.getElementById('frm').append(tabela); //exibe a tabela na tela do usuário
                    } else {
                        document.getElementById('procimg').style.visibility = 'hidden'; //faz sumir o 'loading...'
                        var naoha = document.createElement('b');
                        naoha.setAttribute('style', 'font-size:12px;font-family:verdana;left:15px;')
                        naoha.innerHTML = ' - Não há nenhum registro com "' + pesquisa + '". <a href=""#" id="voltar">Voltar</a>';
                        document.getElementById('frm').append(naoha)
                        document.getElementById('voltar').addEventListener('click', () => {
                            location.reload();
                        });
                        document.getElementById('voltar').setAttribute('style', 'font-size:12px;text-decoration:none;color:blue')
                    }

                    function bglinha(elemento) {
                        elemento.style.background = '#2596be';
                    }
                }
            };
            xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=op139&pesquisa=" + pesquisa, true);
            xmlhttp.send();
        });
    }

    function op030() {
        var ope = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
        if (ope == '22') {
            setTimeout(function() {
                var links = document.getElementsByClassName('sra');
                var links2 = document.getElementsByClassName('sra2');
                for (i = 0; i < links.length; i++) {
                    links[i].outerHTML = links[i].innerHTML;
                }
                for (i = 0; i < links2.length; i++) {
                    links2[i].outerHTML = links2[i].innerHTML;
                }
                var links = document.getElementsByClassName('sra');
                var links2 = document.getElementsByClassName('sra2');
                for (i = 0; i < links.length; i++) {
                    links[i].outerHTML = links[i].innerHTML;
                }
                for (i = 0; i < links2.length; i++) {
                    links2[i].outerHTML = links2[i].innerHTML;
                }
                var links = document.getElementsByClassName('sra');
                var links2 = document.getElementsByClassName('sra2');
                for (i = 0; i < links.length; i++) {
                    links[i].outerHTML = links[i].innerHTML;

                }
                for (i = 0; i < links2.length; i++) {
                    links2[i].outerHTML = links2[i].innerHTML;

                }
                var links = document.getElementsByClassName('sra');
                var links2 = document.getElementsByClassName('sra2');
                for (i = 0; i < links.length; i++) {
                    links[i].outerHTML = links[i].innerHTML;
                }
                for (i = 0; i < links2.length; i++) {
                    links2[i].outerHTML = links2[i].innerHTML;
                }
            }, 1000)
        }

    }

    function op002() { //CONFIGURA OPÇÃO CANCELAMENTO NA OP002
        //adiciona campo "motivo do cancelamento"
        /*
        tela_cinza = document.createElement('div');
        tela_cinza.setAttribute('id', 'tela_cinza')
        tela_cinza.setAttribute('style', 'opacity:0.9;position:absolute;width:100%;height:125%;overflow:hidden;background:dimgrey;z-index:1;')
        document.body.append(tela_cinza);
        */
        var motivos = document.createElement('select');
        motivos.setAttribute('id', 'motivos');
        
        motivos.setAttribute('style', 'top:560px;left:990px;color:blue;font-family:verdana;width:24ch;font-size:10px;border:1px solid blue;');


        motivosOps = ['Erro de Origem', 'Erro de Pagador', 'Erro de Destino', 'Cliente Possui Tabela', 'Erro Código', 'CEP Incorreto', 'Simulação', 'Erro na Sigla', 'Duplicidade', 'Alteração CNPJ', 'Alteração Valor NF', 'Alteração da cidade', 'Alteração na Cubagem', 'Alteração Nº da NF', 'Alteração no peso', 'Alteração QTD Vol', 'Alteração Valor de Frete', 'Cotação Vencida', 'NF Agrupada'];
        var motivosOp = document.createElement('option');
        motivosOp.text = "";
        motivos.appendChild(motivosOp);
        for (i = 0; i < motivosOps.length; i++) {
            var motivosOp = document.createElement('option');
            motivosOp.text = motivosOps[i];
            motivos.appendChild(motivosOp);
        }
        document.body.appendChild(motivos);

        /*
        usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')+4,document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
        numero = document.querySelector('#fil_inc').value + document.querySelector('#seq_cotacao').value;
        console.log(usuario, numero);
        xmlhttp = new XMLHttpRequest();                                                                 //Exibe o motivo que está salvo no bd
        xmlhttp.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200){
                myObj = this.responseText;
                x=JSON.parse(myObj);
                if(x.length>0){
                    console.log(x[0].motivo)
                    document.querySelector('#motivos').value = x[0].motivo;
                }
            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=cancelamentoqual&numero="+numero+"&usuario="+usuario, true);
        xmlhttp.send();
        */
        //adiciona botão cancelar
        document.getElementById('150').style.visibility = 'visible';
        document.getElementById('150').style.left = '1150px';
        document.getElementById('150').style.top = '560px';
        document.getElementById('150').style.textDecoration = 'underline';
        document.getElementById('150').style.color = 'blue';
        document.getElementById('150').addEventListener('mouseover', () => {
            document.getElementById('150').style.color = 'red';
        })
        document.getElementById('150').addEventListener('mouseout', () => {
            document.getElementById('150').style.color = 'blue';
        })
        document.getElementById('150').addEventListener('click', () => {
            opcao = 'COTAÇÃO';
            numero = document.querySelector('#fil_inc').value + document.querySelector('#seq_cotacao').value;
            motivo = document.querySelector('#motivos').value;
            usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0') + 4, document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
            dominio = document.getElementsByClassName("texto3")[0].innerText.substring(8, document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
            unidades = document.getElementById('fil_inc').value;
            infos = {
                f1: opcao,
                f2: numero,
                f3: '-',
                f4: '-',
                f5: motivo,
                f6: dominio,
                f7: usuario,
                f8: unidades
            };
            console.log(opcao, numero, motivo, usuario, dominio, unidades);
            salva_bd(infos, "cancelamento");
        });




        /* OP002_ACOMPANHA embutida aqui*/

        origem = document.createElement('div'); //CAMPO "ORIGEM"
        origem.innerText = 'Origem:';
        origem.setAttribute('style', 'left:582px;top:64px;font-size:10px;font-family:verdana;z-index:2');
        document.getElementById('frm').append(origem);

        origem_campo = document.createElement('select');
        origem_campo.setAttribute('style', 'left:632px;top:63px;font-size:10px;font-family:verdana;color:blue;border:1px solid blue;z-index:2;');
        origem_campo.setAttribute('id', 'origem_cliente');
        origens = ['Ligacao', 'Whatsapp', 'E-mail', 'Presencial', 'MktZap'];
        orig = document.createElement('option');
        orig.text = '';
        origem_campo.appendChild(orig);
        for (i = 0; i < origens.length; i++) {
            orig = document.createElement('option');
            orig.text = origens[i];
            origem_campo.appendChild(orig);
        }
        document.getElementById('frm').append(origem_campo);

            /*
        document.getElementById('origem_cliente').addEventListener('change', ()=>{
            document.getElementById('tela_cinza').style.visibility = 'hidden';
        })
        */

        entrega = document.createElement('div'); //CAMPO "ENTREGA"
        entrega.setAttribute("style", "left:810px;top:240px;font-family:verdana;font-size:10px");
        entrega.innerText = 'Entrega:';
        document.getElementById('frm').append(entrega);

        entr = document.createElement('select');
        entr.style = 'left:860px;top:240px;border:1px solid blue;font-size:10px;color:blue';
        entr.setAttribute('id', 'entregaC')
        entregas = ['Perímetro urbano', 'Zona rural'];
        var entreg = document.createElement('option');
        entreg.text = "";
        entr.appendChild(entreg);
        for (i = 0; i < entregas.length; i++) {
            var entreg = document.createElement('option');
            entreg.text = entregas[i];
            entr.appendChild(entreg);
        }
        document.getElementById('frm').append(entr);



        tipo_embalagem = document.createElement('div'); //CAMPO TIPO DE EMBALAGEM
        tipo_embalagem.setAttribute('style', 'left:520px;top:80px;font-size:10px;font-family:verdana')
        tipo_embalagem.innerText = 'Tipo de Embalagem:'
        document.getElementById('frm').append(tipo_embalagem);

        tiposEmbalagem = document.createElement('select');
        tiposEmbalagem.setAttribute('id', 'tipo_embalagem');
        tiposEmbalagem.setAttribute('style', 'left:632px;top:80px;font-size:10px;font-family:verdana;color:blue;border:1px solid blue');
        tipos = ['Caixa de papelão', 'Caixa de madeira', 'Saco', 'Balde', 'Engradado', 'Outro'];
        var tipoEmb = document.createElement('option');
        tipoEmb.text = "";
        tiposEmbalagem.appendChild(tipoEmb);
        for (i = 0; i < tipos.length; i++) {
            var tipoEmb = document.createElement('option');
            tipoEmb.text = tipos[i];
            tiposEmbalagem.appendChild(tipoEmb);
        }
        document.getElementById('frm').append(tiposEmbalagem);

        pesoOp = document.createElement('input') //CAMPO PESO
        pesoOp.setAttribute('style', 'left:710px;top:288px');
        pesoOp.setAttribute('type', 'radio')
        pesoOp.setAttribute('id', 'radioNota')
        pesoOp.setAttribute('name', 'pesoOp')
        document.getElementById('frm').append(pesoOp);
        pesoP = document.createElement('div');
        pesoP.setAttribute('style', 'left:725px;top:288px;font-family:verdana;font-size:10px');
        pesoP.innerText = 'Nota Fiscal';
        document.getElementById('frm').append(pesoP);
        pesoP = document.createElement('div');
        pesoP.setAttribute('style', 'left:805px;top:288px;font-family:verdana;font-size:10px');
        pesoP.innerText = 'Sem peso (colocar a caneta)';
        document.getElementById('frm').append(pesoP)
        pesoOp = document.createElement('input');
        pesoOp.setAttribute('style', 'left:790px;top:288px');
        pesoOp.setAttribute('type', 'radio')
        pesoOp.setAttribute('id', 'radioSempeso')
        pesoOp.setAttribute('name', 'pesoOp')
        document.getElementById('frm').append(pesoOp);
        document.getElementById('radioNota').checked = true;


        nota_fiscal = document.createElement('select'); //CAMPO NOTA-FISCAL
        nota_fiscal.setAttribute('id', 'nota_fiscal');
        nota_fiscal.style = 'left:448px;top:64px;border:1px solid blue;font-size:10px;color:blue';
        nfOps = ['Sim', 'Declaração'];
        var nfOp = document.createElement('option');
        nfOp.text = "";
        nota_fiscal.appendChild(nfOp);
        for (i = 0; i < nfOps.length; i++) {
            var nfOp = document.createElement('option');
            nfOp.text = nfOps[i];
            nota_fiscal.appendChild(nfOp);
        }
        document.getElementById('frm').append(nota_fiscal)
        nota_f = document.createElement('div');
        nota_f.setAttribute('style', 'left:270px;text-align:right;top:64px;font-size:10px;font-family:verdana');
        nota_f.innerText = 'Nota fiscal apta para transporte?:'
        document.getElementById('frm').append(nota_f);


        novo_campo = document.createElement('div'); //"FORMA DE PAGAMENTO"
        novo_campo.setAttribute('id', 'forma_p');
        novo_campo.innerText = "Forma de Pagamento:";
        novo_campo.setAttribute('style', 'position:absolute;font-family:verdana;font-size:10px;left:990px;top:640px;');
        document.getElementById('frm').append(novo_campo);
        document.getElementById('forma_p').title = "1.PIX: pagamento via QR cod cadastrar e-mail 483> XML para recebimento da DACT - 2.LINK: pagamento Link solicitar link após emissão da DACT pra o nº 66 9685-2677 - 3.Boleto Bancário: Emitido fatura enviada por e-mail ao cliente. - 4.Transferência bancária (Deposito): Para Clientes especiais e ou com autorização do financeiro. - 5.Cartão de Crédito: Com pagamento a vista ou parcelado (com parcela mínima de R$100,00). Opção disponível somente para filial. - 6.Dinheiro: somente para mercadoria retirada/deixada no armazém das filiais , ou na coleta com a devida autorização.";
        novo_campo = document.createElement('select');
        novo_campo.setAttribute('id', 'forma_pagamento');
        novo_campo.setAttribute('style', 'font-family:verdana;font-size:10px;width:24ch;left:1130px;top:638px;border:1px solid blue;color:blue;padding:0px');
        document.getElementById('frm').append(novo_campo);
        option = document.createElement("option");
        option.value = "PIX";
        option.text = "PIX";
        novo_campo.appendChild(option);
        option = document.createElement("option");
        option.value = "LINK";
        option.text = "LINK";
        novo_campo.appendChild(option);
        option = document.createElement("option");
        option.value = "Boleto Bancário";
        option.text = "Boleto Bancário";
        novo_campo.appendChild(option);
        option = document.createElement("option");
        option.value = "Transferência/Depósito";
        option.text = "Transferência/Depósito";
        novo_campo.appendChild(option);
        option = document.createElement("option");
        option.value = "Cartão de Crédito";
        option.text = "Cartão de Crédito";
        novo_campo.appendChild(option);
        option = document.createElement("option");
        option.value = "Dinheiro";
        option.text = "Dinheiro";
        novo_campo.appendChild(option);




        novo_campo = document.createElement('input'); //CAMPO OBSERVAÇÃO + BOTÃO "ACOMPANHAR"
        novo_campo.setAttribute('id', 'observacao')
        novo_campo.setAttribute('style', 'left:1130px;top:620px;font-size:10px;width:24ch;font-family:verdana;border:1px solid blue')
        document.getElementById('frm').append(novo_campo)
        acompanhar = document.createElement('a');
        acompanhar.setAttribute('style', 'left:1200px;top:670px;font-family:verdana;font-size:10px;color:blue');
        acompanhar.innerText = 'Acompanhar'
        acompanhar.setAttribute('href', '#')
        acompanhar.setAttribute('id', 'acompanhar');
        document.getElementById('frm').append(acompanhar)
        observacao = document.createElement('div');
        observacao.innerText = 'Observação:';
        observacao.setAttribute('style', 'font-family:verdana;font-size:12px;left:990px;top:618px;');
        document.getElementById('frm').append(observacao);

        document.getElementById('acompanhar').addEventListener('click', () => {
            forma_pagamento = document.getElementById('forma_pagamento').value;
            numero = document.getElementById('seq_cotacao').value;
            nome = document.getElementById('3').value;
            usuario = getCookie('login');
            obs = document.getElementById('observacao').value;
            entrega = document.getElementById('entregaC').value;
            nota_fiscal = document.getElementById('nota_fiscal').value;
            tipo_embalagem = document.getElementById('tipo_embalagem').value;
            if (document.getElementById('radioNota').checked == true) {
                peso = 'Nota';
            } else {
                peso = 'Sem peso';
            }
            origem = document.getElementById('origem_cliente').value
            obj = {
                forma_pagamento: forma_pagamento,
                numero: numero,
                usuario: usuario,
                obs: obs,
                nome: nome,
                entrega: entrega,
                nota: nota_fiscal,
                embalagem: tipo_embalagem,
                peso: peso,
                origem: origem
            }
            salva_bd(obj, "op002_acompanha");
            setCookie('attm', 'atualizar', 365);
            setTimeout(function() {
                window.close();
            }, 3500);
        });

        usuario = getCookie('login');
        numero = document.getElementById('seq_cotacao').value;
        xmlhttp = new XMLHttpRequest(); //Exibe os valores que estão salvos no bd
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                myObj = this.responseText;
                x = JSON.parse(myObj);
                if (x.length > 0) {
                    document.getElementById('observacao').value = x[0].obs
                    document.getElementById('entregaC').value = x[0].entrega;
                    document.getElementById('nota_fiscal').value = x[0].nota;
                    document.getElementById('tipo_embalagem').value = x[0].embalagem;
                    document.getElementById('origem_cliente').value = x[0].origem;
                    document.getElementById('forma_pagamento').value = x[0].forma_pagamento;
                    if (x[0].peso == 'Nota') {
                        document.getElementById('radioNota').checked = true;
                    } else {
                        document.getElementById('radioSempeso').checked = true;
                    }

                }
            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=op002_andamento&numero=" + numero, true);
        xmlhttp.send();

    }

    function op003() { //FUNÇÕES CANCELAR e ALTERAR DATA DE COLETA na 003

        var cancelamento = document.getElementById('link_can');
        cancelamento.style.left = '470px';
        cancelamento.style.top = '515px';
        cancelamento.style.color = 'blue';
        cancelamento.hidden = true;
        cancelamento.disabled = true;
        cancelamento.addEventListener('click', () => {
            opcao = 'COLETA';
            numero = document.getElementById('nro_coleta').value;
            data_limite = document.getElementById('fld_data_lim').value;
            hora_limite = document.getElementById('fld_hora_lim').value;
            motivo = document.getElementById('motivo').value;
            usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0'), document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
            dominio = document.getElementsByClassName("texto3")[0].innerText.substring(8, document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
            unidade = document.getElementById('fld_qtde_vol').value;
            infos = {
                f1: opcao,
                f2: numero,
                f3: data_limite,
                f4: hora_limite,
                f5: motivo,
                f6: dominio,
                f7: usuario,
                f8: unidade
            }
            salva_bd(infos, "cancelamento");
        });

        var cancela = document.createElement('a');
        cancela.append('Cancelar');
        cancela.style.left = '376px';
        cancela.style.top = '496px';
        cancela.style.color = 'navy';
        cancela.style.textDecoration = 'underline';
        cancela.setAttribute('href', '#');
        cancela.addEventListener('mouseover', () => {
            cancela.style.color = 'red'
        });
        cancela.addEventListener('mouseout', () => {
            cancela.style.color = 'navy';
        });

        cancela.addEventListener('click', () => {
            cancelamento.removeAttribute('hidden');
            cancelamento.removeAttribute('disabled');
            cancela.style.display = 'none';
            var motivos = document.createElement('select');
            motivos.style.left = "250px";
            motivos.style.color = 'blue';
            motivos.style.top = "515px";
            motivos.style.fontSize = '12px';
            motivos.style.border = '1px solid blue';
            motivos.setAttribute('id', 'motivo');
            motivosOps = ['Estabelecimento Fechado', 'Cliente Não Localizado', 'Coleta Prejudicada Pelo Horário', 'Nota Fiscal não liberada/emitida', 'Cliente Ausente', 'Mercadoria não pronta para coleta', 'Veículo quebrado no percurso'];
            var opcao = document.createElement('option');
            opcao.text = "";
            motivos.appendChild(opcao);
            for (i = 0; i < motivosOps.length; i++) {
                var opcao = document.createElement('option');
                opcao.text = motivosOps[i];
                motivos.appendChild(opcao);
            }
            document.body.append(motivos);
        });


        document.body.append(cancela);



        var dataTags = document.getElementsByClassName('data');
        //console.log(dataTags)
        if (dataTags[35].innerHTML == "") { //desabilita os outros campos caso esse citado esteja preenchido
        } else {

            document.getElementById('fld_data_lim').disabled = true;
            document.getElementById('fld_data_lim').style.border = '0px';
            document.getElementById('fld_hora_lim').disabled = true;
            document.getElementById('fld_hora_lim').style.border = '0px';
            document.getElementById('fld_vlr_merc').disabled = true;
            document.getElementById('fld_vlr_merc').style.border = '0px';
            document.getElementById('fld_qtde_vol').disabled = true;
            document.getElementById('fld_qtde_vol').style.border = '0px';
            document.getElementById('fld_peso').disabled = true;
            document.getElementById('fld_peso').style.border = '0px';
            document.getElementById('fld_cub').disabled = true;
            document.getElementById('fld_cub').style.border = '0px';
            document.getElementById('fld_placa_veic').disabled = true;
            document.getElementById('fld_placa_veic').style.border = '0px';
            document.getElementById('fld_placa_car').disabled = true;
            document.getElementById('fld_placa_car').style.border = '0px';
            document.getElementById('fld_mot').disabled = true;
            document.getElementById('fld_mot').style.border = '0px';

            novolink = document.createElement('a');
            texto = document.createTextNode('Alterar Data de Coleta');
            novolink.appendChild(texto);
            novolink.setAttribute('id', 'libera');
            novolink.setAttribute('href', '#');
            document.getElementsByClassName('data')[30].append(novolink);
            document.getElementsByClassName('data')[30].style.width = '22ch';
            document.getElementsByClassName('data')[30].style.height = '4ch';
            document.getElementById('libera').addEventListener('click', () => {
                liberaCampos();
            });
        }
    }

    function liberaCampos() { //libera os campos desativados ao clicar em ALTERAR

        document.getElementById('fld_data_lim').disabled = false;
        document.getElementById('fld_data_lim').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_hora_lim').disabled = false;
        document.getElementById('fld_hora_lim').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_vlr_merc').disabled = false;
        document.getElementById('fld_vlr_merc').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_qtde_vol').disabled = false;
        document.getElementById('fld_qtde_vol').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_peso').disabled = false;
        document.getElementById('fld_peso').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_cub').disabled = false;
        document.getElementById('fld_cub').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_placa_veic').disabled = false;
        document.getElementById('fld_placa_veic').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_placa_car').disabled = false;
        document.getElementById('fld_placa_car').style.border = '1px solid rgb(216,216,255)';
        document.getElementById('fld_mot').disabled = false;
        document.getElementById('fld_mot').style.border = '1px solid rgb(216,216,255)';

        document.getElementById('libera').addEventListener('click', () => {
            data = document.getElementById('fld_data_lim').value;
            hora = document.getElementById('fld_hora_lim').value;
            ncoleta = document.getElementById('nro_coleta').value;
            unidades = document.getElementById('fld_qtde_vol').value;
            usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0'), document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
            dominio = document.getElementsByClassName("texto3")[0].innerText.substring(8, document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
            obj = {
                f1: data,
                f2: hora,
                f3: ncoleta,
                f4: unidades,
                f5: usuario,
                f6: dominio
            }
            salva_bd(obj, "coleta");
        });

    }




    function inicio() {
        var grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
        var user = ["otaviofd", "lidiane", "jacira", "artur"];
        node = document.createElement('div');
        node.setAttribute("style", "left:230px;bottom:8px;");
        node.setAttribute("class", "texto3");
        texto = document.createTextNode("Versao " + chrome.runtime.getManifest().version + " -- Grupo: " + grupo);
        node.appendChild(texto);
        document.getElementById('infodiv').after(node);
        usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0'), document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
        dominio = document.getElementsByClassName("texto3")[0].innerText.substring(0, document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
        node.addEventListener("click", function() {
            if (user.includes(usuario)) {
                console.log('Abrindo pagina de controle de acesso');
                criaTabelaAcesso();
            }
        });

        if (dominio == 'OTC' || dominio == 'GEN') {
            node = document.createElement('div');
            node.setAttribute("style", "left:300px;bottom:8px;");
            node.setAttribute("class", "texto3");
            texto = document.createTextNode("AJUDA - Clique aqui");
            node.appendChild(texto);
            document.getElementById('infodiv').after(node);
            node.addEventListener("click", function() {
                var janela = window.open('http://sswresponse.azurewebsites.net/ajuda.html', '_blank', "fullscreen=0,menubar=0,location=0,toolbar=0," +
                    "status=1,scrollbars=1,resizable=1,width=" + (screen.availWidth - 10) +
                    ",height=" + (screen.availHeight - 10) + ",top=0,left=0");
                janela.resizeTo(552, screen.availHeight);
            });

            /*
            node = document.createElement('div');
            node.setAttribute("style", "left:430px;bottom:8px;");
            node.setAttribute("class", "texto3");
            node.setAttribute("id", "agente");
            texto = document.createTextNode("Agente: "+agente+" - Clique para mudar");
            node.appendChild(texto);
            document.getElementById('infodiv').after(node);
            node.addEventListener("click", function(){
                agente = prompt("Qual o seu ID do agente CALLCENTER. Se não tiver, só dar o OK", "1111");
                if (agente == null || agente == "" ) {
                    agente = '';
                } 
                console.log('agente'+agente);
                chrome.storage.local.set({'agente': agente}); 
                    document.getElementById('agente').innerText="Agente: "+agente+" - Clique para mudar";         
            });
            */
        }

    }

    //FUNC: form desconto/cancelamento
    //
    //Liberado para todos
    function form_desconto() {
        node = document.createElement('a');
        node.setAttribute("id", "lnk_form_desconto")
        node.setAttribute('class', 'baselnk');
        node.setAttribute('style', "position: absolute;top:124px; left:784px;text-align:left; ");
        texto = document.createTextNode("Formulario Desconto/Cancelamento");
        node.appendChild(texto);
        document.getElementById("frm").appendChild(node);

        motivos = ["1-CADASTRO DE CLIENTE INCORRETO", "2-COBRANÇA TAXA INDEVIDA", "3-MERCADORIA DE USO UND PROPRIA/PARCEIRA", "4-REVERSÃO DE FRETE / ALTERA TABELA", "5-ERRO DO CLIENTE  EMISSAO NF", "6-ERRO DO CLIENTE AO ENVIAR ARQUIVO EDI", "7-REAJUSTE INDEVIDO", "8-COTACAO NÃO ACATADA POR DIVERGENCIA / NÃO CONTRATADA", "9-DUPLICIDADE EMISSAO COM A MESMA NF", "10-FALTA / ERRO DE AGRUPAMENTO NF", "11-EMISSAO REMET/ DEST/TOMADOR INCORRETO/ DADOS DIVERGENTE", "12-NAO RESPEITOU MENSAGEM DE TELA", "13-PESO / CUBAGEM INCORRETO EMISSAO", "14-COTACAO NAO ACATADA NA EMISSAO", "15-EMISSAO FORA TABELA /TRANS/DEVOL", "16-ATRASO NO CADASTRO DA TABELA", "17-TABELA CADASTRADA ERRADA", "18-FALHA DO SISTEMA SSW  TI", "19-FALHA FORMALIZAÇÃO DA TABELA", "20-ATRASO/ PROBLEMA COLETA/ ENTREGA", "21-SEM CARIMBO EXPRESS", "22-PROMOCIONAL COM RECUSA", "23-CÓDIGO INCORRETO NA EMISSÃO / Cliente possui tabela em outro código / outro serviço", "24-OUTROS  DETALHE"];
        node = document.createElement("select");
        node.setAttribute("id", "motivo");
        node.setAttribute("style", "left:1000px; top:124px;text-align:left;border: 1px solid;");
        node.setAttribute("name", "motivo");
        node.setAttribute("class", "nodata formdesconto");
        document.getElementById("frm").appendChild(node);
        for (var i = 0; i < motivos.length; i++) {
            var option = document.createElement("option");
            option.value = i;
            option.text = motivos[i];
            node.appendChild(option);
        }

        node = document.createElement("input");
        node.setAttribute("type", "text");
        node.setAttribute("name", "valordesconto");
        node.setAttribute("style", "left:1000px;top:144px;");
        node.setAttribute("id", "valordesconto");
        node.setAttribute("class", "formdesconto");
        document.getElementById("frm").appendChild(node);

        node = document.createElement("input");
        node.setAttribute("type", "textarea");
        node.setAttribute("name", "descricao");
        node.setAttribute("style", "left:1000px;top:170px;");
        node.setAttribute("id", "descricao");
        node.setAttribute("class", "formdesconto");
        document.getElementById("frm").appendChild(node);

        document.getElementById("lnk_form_desconto").addEventListener("click", function() {

        })
    }
    // A DESENVOVLER
    function expedicao() {

        /* aumetar espaco na opcao 4 de digitacao para colocar o camp NR par afora
        
        /aqui pelos que tem id em numero
        for(i=76;i<200;i++){
        var y = document.getElementById(i);
        y.style.top = (parseInt(y.style.top.substring(0,3))+16).toString()+"px";
        }   
        
        /aqui pelos que tem id em texto
        var nome_id = ["especie_descricao","merc_descricao","msgm3","msgqtd","msgpeso"];
        
        function func_espaco(item,index){
        var y = document.getElementById(item);
        y.style.top = (parseInt(y.style.top.substring(0,3))+16).toString()+"px";
        }
        
        nome_id.forEach(func_espaco);
        
        */

    }


    //FUNC: Limpa CNPJ
    //Limpa pontos e traços do CNPJ
    //Liberado para todos
    function cnpj() {
        var node2;

        node2 = document.createElement("input");
        node2.setAttribute("type", "text");
        node2.setAttribute("name", "limpaCnpj");
        node2.setAttribute("style", "left:300px;top:64px;");
        node2.setAttribute("id", "limpaCnpj");
        document.getElementById("frm").appendChild(node2);
        document.getElementById('limpaCnpj').addEventListener('input', function(evt) {
            document.getElementById(limpaCnpj).value = document.getElementById(limpaCnpj).value.replace(/[^\d]+/g, '')
        });


    }

function consulta_calendario(unidade){

        node2 = document.createElement("div");
                node2.setAttribute('id', 'titulo_calendario');
                node2.setAttribute('style', 'position:absolute;left:1070px;top:170px;text-align:left;font-family:verdana;font-size:12px');
                node2.innerHTML = '';
                document.getElementById('frm').append(node2);

        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            
            myObj = this.responseText;
            //console.log(myObj);
            x = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
            if (x.length > 0) {
                console.log('calendario:' + x.length)
                document.getElementById('titulo_calendario').innerHTML = '<b>Quantidade de Entregas do Meli<br>por dia de venda (' + unidade + ')</b>';
                
                html = '';
                html += '<tr><td style="border:5px solid white;font-size:10px;"><b style="color:blue">DIA DA SEMANA</b><br><b style="color:red">SEMANA DO ANO</b></td><td style="vertical-align:top;border:5px solid white;font-size:10px;color:blue">SEG</td><td style="vertical-align:top;color:blue;border:5px solid white;font-size:10px;">TER</td><td style="vertical-align:top;color:blue;border:5px solid white;font-size:10px;">QUA</td><td style="vertical-align:top;color:blue;border:5px solid white;font-size:10px;">QUI</td><td style="vertical-align:top;color:blue;border:5px solid white;font-size:10px;">SEX</td><td style="vertical-align:top;color:blue;border:5px solid white;font-size:10px;">SAB</td><td style="vertical-align:top;color:blue;border:5px solid white;font-size:10px;">DOM</td></tr><tr>';
            }
            semana = 0;
            for(i=0;i<x.length;i++){
                if(x[i].semana == semana){
                }else{
                    html += '</tr><tr><td style="border:3px solid white;font-size:10px;color:red;">' + x[i].semana + '</td>';
                    semana = x[i].semana;    
                }
                html += '<td style="border:3px solid white;font-size:10px;">' + x[i].qtd + '</td>';
            }
        }
        document.getElementById('calendario_novo').innerHTML = '';
        document.getElementById('calendario_novo').innerHTML = html;
    };
    xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=calendario&unidade=" + unidade, true);
    xmlhttp.send();
}

    //FUNC: COLETA PARCEIROS
    //Verifica se novas coletas WEB foram cadastradas
    //Liberar somente para equipe RDN MTZ 07,09,38,10
    function op001_1() {
        html = '';

                node = document.createElement('a');
                node.setAttribute('id', 'atualizar_calendario');
                node.setAttribute('href', '#');
                node.setAttribute('style', 'font-family:verdana;font-size:12px;position:absolute;top:150px;left:1040px;text-decoration:none;color:blue;');
                node.innerText = 'Atualizar calendário';
                document.getElementById('frm').append(node);

                                   //div calendário
                node = document.createElement("table");
                node.setAttribute('id', 'calendario_novo');
                node.setAttribute('style', 'position:absolute;top:200px;left:1020px;font-size:22px;')
                document.getElementById('frm').append(node);

                document.getElementById('atualizar_calendario').addEventListener('click', ()=>{
                    unit = document.getElementById('2').value;
                    consulta_calendario(unit)
                });

                unit = document.getElementById('2').value;
                consulta_calendario(unit);

        chrome.storage.local.get(['permissao'], function(result) {
            //dominio = document.getElementsByClassName("texto3")[0].innerText.substring(0,document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
            dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText
            permissao = result.permissao.split(',');
            if (permissao.includes('op001_1') && dominio == 'OTC') {


                /*
                var node;
                alert("entrei");
                node = document.createElement("script");
                node.type = 'text/javascript';
                node.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js';    
                document.getElementsByTagName('body')[0].appendChild(node);
                */
/*
                consultar_cal = document.createElement('a');
                consultar_cal.setAttribute('style', 'position:absolute;left:1070px;top:145px;');
                consultar_cal.innerText = 'Entregas do Meli'
                consultar_cal.setAttribute('href','#');
                consultar_cal.setAttribute('id', 'consultar_cal_botao')
                document.getElementById('frm').append(consultar_cal);
*/




 


                

                

                //div tag
                node = document.createElement("div");
                node.setAttribute("id", "div_link_coleta");
                node.setAttribute("style", "height: 50px; width: 250px; top: 40px; left: 1020px;");
                document.getElementById("frm").append(node);

                //link para verificar se tem novas coletas
                node = document.createElement("a");
                node.setAttribute("id", "link_coletas_parceiro");
                node.setAttribute("onfocus", "obj=this;");
                node.setAttribute("style", "left:50px; top:00px;");
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("Checa novas coletass");
                node.appendChild(texto);
                document.getElementById("div_link_coleta").append(node);
                document.getElementById("link_coletas_parceiro").addEventListener("click", function() {
                    checa_coleta();
                });

                node = document.createElement("div");
                node.setAttribute("class", "texto");
                node.setAttribute("id", "div_texto");
                node.setAttribute("style", "top: 16px; left: 100px;");
                texto = document.createTextNode("Nenhuma nova coleta");
                node.appendChild(texto);
                document.getElementById("div_link_coleta").append(node);

                node = document.createElement('div');
                node.setAttribute('style', 'height:50px;width:250px;top:100px;left:1070px;text-align:left');
                node.setAttribute('id', 'div_descarga_gaiola');
                node.setAttribute("class", "texto");
                document.getElementById('frm').append(node);
                document.getElementById('div_descarga_gaiola').innerHTML = '</form><form action="https://sswresponse.azurewebsites.net/coleta.php" method="POST" target="_blank"> <input type="text" name="gaiola" value="ok" hidden><input type="submit" value="Descarga GaiolaA" id="gaiolab" style="border:0px;background:white;text-decoration:underline;color:navy"></form>';

                document.getElementById('gaiolab').addEventListener('mouseover', () => {
                    document.getElementById('gaiolab').style.color = 'red';
                });
                document.getElementById('gaiolab').addEventListener('mouseout', () => {
                    document.getElementById('gaiolab').style.color = 'navy';
                });


            }


        });
    }

    //FUNC: COTACAO NAO FECHADAS
    //Gerar relatorio das cotacoes nao fechadas
    //Liberar para equipe Comercial FIL e UNID 38,09,10,24
    function cotacao() {
        //TODO: buscar se já tem dado na cotacao, mostrar o dado e bloquear o campo para alteracao
        chrome.storage.local.get(['permissao'], function(result) {
            permissao = result.permissao.split(',');
            //dominio = document.getElementsByClassName("texto3")[0].innerText.substring(0,document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
            dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim();

            if (permissao.includes('cotacao') && dominio == 'OTC') {

                var motivo, cad_merc, node, texto, usuario, valor;
                //Select do motivo

                motivos = ['', 'Valor do frete', 'Sem retorno', 'Não Atende', 'Pedido Cancelado', 'Prazo não atende', 'Erro de emissão', 'Contratada', 'Dados divergentes', 'Dados incompletos', 'Tipo de mercadoria ', 'Documento fiscal não válido p/ transporte', 'Emitido informado', 'Coleta não realizada no prazo', 'Quimico', 'Sem embalagem ', 'Valor do redespacho', 'Problema com sistema', 'Cotação Duplicada indevida'];

                //usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0'),document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
                usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0') + 4, document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();

                node = document.createElement("select");
                node.setAttribute("id", "cvl1");
                node.setAttribute("style", "left:450px; top:672px;text-align:left;border: 1px solid;");
                node.setAttribute("name", "motivo");
                node.setAttribute("class", "nodata");
                document.getElementById("frm").appendChild(node);

                for (var i = 0; i < motivos.length; i++) {
                    var option = document.createElement("option");
                    option.value = motivos[i];
                    option.text = motivos[i];
                    node.appendChild(option);
                }

                //Select da mercadoria
                cad_merc = ['', 'Confecção', 'Peças', 'Lubrificante', 'Maquinas', 'Mat. Eletrico', 'Calçados', 'Papelaria', 'Cotação Rodonaves', 'Equipamentos', 'Peças Agricola', 'Mat. Para Construção', 'Diversos', 'Cosmeticos'];

                node = document.createElement("select");
                node.setAttribute("name", "cad_merc");
                node.setAttribute("class", "nodata");
                //node.setAttribute("style", "left:840px; top:352px;text-align:left;");
                node.setAttribute("style", "left:270px; top:176px;text-align:left;border: 1px solid;");
                node.setAttribute("id", "cvl2");
                document.getElementById("frm").appendChild(node);

                for (var i = 0; i < cad_merc.length; i++) {
                    var option = document.createElement("option");
                    option.value = cad_merc[i];
                    option.text = cad_merc[i];
                    node.appendChild(option);
                }


                //Input
                node = document.createElement("div");
                node.setAttribute("class", "texto");
                node.setAttribute("style", "left:400px; top:672px;text-align:left;");
                node.setAttribute("id", "cvl5");
                texto = document.createTextNode("Motivo:");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);

                /*
                node = document.createElement("div");
                node.setAttribute("class", "texto");
                node.setAttribute("style", "left:760px; top: 352px;text-align:left;");
                node.setAttribute("id", "cvl6");
                texto = document.createTextNode("Mercadoria:");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);
                */
                /*
                TODO: Implementar um lembrete por email para o cliente, setar um tempo para que ele feche a cotacao
                
                node = document.createElement("input");
                node.setAttribute("type", "text");
                node.setAttribute("name", "status");
                node.setAttribute("style", "left:840px; top:368px;text-align:left;");
                node.setAttribute("id", "cvl4");
                document.getElementById("frm").appendChild(node);
                
                node = document.createElement("div");
                node.setAttribute("class", "texto");
                node.setAttribute("style", "left:760px; top: 368px;text-align:left;");
                node.setAttribute("id", "cvl7");
                texto = document.createTextNode("E-mail:");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);
                */

                node = document.createElement("a");
                node.setAttribute("id", "salva_cotacao");
                node.setAttribute("onfocus", "obj=this;");
                node.setAttribute("style", "left:700px; top:672px;");
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("Salvar Cotacao");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);
                document.getElementById("salva_cotacao").addEventListener("click", function() {

                    var fil_inc, seq_cotacacao, id2, id3, freteinicial, id133, descatual, data, motivo, mercadoria, vendedor, data_incl;
                    fil_inc = document.getElementById("fil_inc").value;
                    seq_cotacacao = document.getElementById("seq_cotacao").value;

                    if (seq_cotacacao == "") {
                        alert('Sem cotação feita! Não pode salvar')
                    } else {
                        id2 = document.getElementById("2").value;
                        id3 = document.getElementById("3").value;
                        freteinicial = document.getElementById("freteinicial").value;
                        id133 = document.getElementById("133").value;
                        descatual = document.getElementById("descatual").value;
                        data_incl = document.getElementsByClassName('data')[3].innerText.substr(0, 8);
                        data_alte = document.getElementsByClassName('data')[4].innerText.substr(0, 8);
                        motivo = document.getElementById("cvl1").value;
                        mercadoria = document.getElementById("cvl2").value;
                        vendedor = document.getElementById("vendedor").value;
                        situacao = document.getElementById("situacao").value;
                        //email = document.getElementById("cvl4").value;
                        email = "";
                        obj = {
                            f1: fil_inc,
                            f2: seq_cotacacao,
                            f3: id2,
                            f4: id3,
                            f5: freteinicial,
                            f6: id133,
                            f7: descatual,
                            usuario: usuario,
                            motivo: motivo,
                            mercadoria: mercadoria,
                            vendedor: vendedor,
                            identificador: "naoFechadas",
                            situacao: situacao,
                            email: email,
                            data_incl: data_incl,
                            data_alte: data_alte
                        };
                        salva_bd(obj, "cot");
                    }


                    /* testando */

                    forma_pagamento = document.getElementById('forma_pagamento').value;
                    numero = document.getElementById('seq_cotacao').value;
                    nome = document.getElementById('3').value;
                    obs = document.getElementById('observacao').value;
                    entrega = document.getElementById('entregaC').value;
                    nota_fiscal = document.getElementById('nota_fiscal').value;
                    usuario = getCookie('login');
                    tipo_embalagem = document.getElementById('tipo_embalagem').value;
                    if (document.getElementById('radioNota').checked == true) {
                        peso = 'Nota';
                    } else {
                        peso = 'Sem peso';
                    }
                    origem = document.getElementById('origem_cliente').value
                    obj = {
                        forma_pagamento: forma_pagamento,
                        numero: numero,
                        usuario: usuario,
                        obs: obs,
                        nome: nome,
                        entrega: entrega,
                        nota: nota_fiscal,
                        embalagem: tipo_embalagem,
                        peso: peso,
                        origem: origem
                    }
                    salva_bd(obj, "op002_acompanha");
                    setCookie('attm', 'atualizar', 365);
                    setTimeout(function() {
                        window.close();
                    }, 3500);

                });
                /* testando */

                node = document.createElement("a");
                node.setAttribute("id", "cotacao_rte");
                node.setAttribute("onfocus", "obj=this;");
                node.setAttribute("style", "left:240px; top:672px;");
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("Cotacao RTE");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);
                document.getElementById("cotacao_rte").addEventListener("click", function() {

                    var fil_inc, seq_cotacacao, id2, id3, freteinicial, id133, descatual, data, motivo, mercadoria, vendedor;
                    fil_inc = document.getElementById("fil_inc").value;
                    seq_cotacacao = document.getElementById("seq_cotacao").value;
                    id2 = document.getElementById("2").value;
                    id3 = document.getElementById("3").value;
                    freteinicial = document.getElementById("freteinicial").value;
                    id133 = document.getElementById("133").value;
                    descatual = document.getElementById("descatual").value;

                    motivo = document.getElementById("cvl1").value;
                    mercadoria = document.getElementById("cvl2").value;
                    vendedor = document.getElementById("vendedor").value;

                    obj = {
                        f1: fil_inc,
                        f2: seq_cotacacao,
                        f3: id2,
                        f4: id3,
                        f5: freteinicial,
                        f6: id133,
                        f7: descatual,
                        usuario: usuario,
                        motivo: '',
                        mercadoria: '',
                        vendedor: vendedor,
                        identificador: "cotacaoRTE"
                    };
                    salva_bd(obj, "cot");

                });

                seq_cotacacao = document.getElementById("seq_cotacao").value;
                xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        myObj = this.responseText;
                        //console.log(myObj);
                        x = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
                        if (x.length > 0) {
                            console.log(x[x.length - 1])
                            document.getElementById("cvl2").value = x[x.length - 1].mercadoria
                            document.getElementById("cvl1").value = x[x.length - 1].motivo
                            if(x[x.length-1].motivo == ''){

                            }else{
                                document.getElementById('cvl1').disabled = true;
                            }
                        }
                    }
                };
                xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=get_cot&f1=" + seq_cotacacao, true);
                xmlhttp.send();


            }
        });
    }

    //FUNC: MOSTRAR MD KG E % DE NF
    //Adiciona dois novos campos na opc de cotacao, que mostra qual a media kg do frete e o % sobre vlr de NF
    //Liberar para TODOS
    function mediakg_cotacao() {
        //BUG: quando clica em "Alterar" some tudo e nao volta
        mostrador_mdkg();
        document.getElementById('133').addEventListener('input', function(evt) {
            mostrador_mdkg();
        });
    }

    //FUNC: MOSTRAR CTE EM ACOMPANHAMENTO // MOSTRA CTE CONSULTADOS
    //Tela na opcao 101 onde mostra uma tabela com os CTe que voce colocou para acompanhar
    //Liberar para TODOS
    function op101_1() {
        
        var node, node2, texto, script;
        var cte, rem, dest, unid, peso, usuario;
        var dbParam, xmlhttp, myObj, x, html, cor, estilo, linha;
        usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0') + 4, document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
        dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim();

        script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
        script.type = 'text/javascript';
        document.getElementById('frm').appendChild(script);


        node = document.createElement("div");
        node.setAttribute("id", "divTabela");
        node.setAttribute("style", "left:100px; top:336px;text-align:left;");
        document.getElementById("frm").appendChild(node);

        node2 = document.createElement("table");
        node2.setAttribute("id", "tabela");
        node2.setAttribute("class", "srdiv");
        node2.setAttribute("style", "table-layout: fixed;");
        node.appendChild(node2);

        var table = document.getElementById('tabela');

        var event = new Event('click');

        table.addEventListener('click', function(e) {
            if (e.target.nodeName.toUpperCase() == "A") {
                console.log(e.target.id.substring(3));
                linha = parseInt(e.target.id.substring(3)) + 1;
                //console.log(linha);
                var cte;
                cte = document.getElementById("cte" + linha.toString()).innerHTML;
                obj = {
                    cte: cte
                };
                //console.log(cte);
                if (e.target.className.toUpperCase() == "IMGLNK REMOVER") {
                    console.log(e.target.className.toUpperCase());
                    obj = {
                        cte: cte,
                        usuario: usuario
                    };
                    salva_bd(obj, "rem_acomp");
                }
                if (e.target.className.toUpperCase() == "IMGLNK SAC") {
                    console.log(e.target.className.toUpperCase());
                    var data = new Date();
                    data = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
                    obj = {
                        cte: cte,
                        data: data
                    };
                    salva_bd(obj, "rem_sac");
                }

                document.getElementById("linha" + linha.toString()).remove();
            } else if (e.target.nodeName.toUpperCase() == "DIV") {
                if (e.target.id) {
                    //console.log(e.target.innerHTML);
                    document.getElementById("t_ser_ctrc").value = e.target.innerHTML.substring(0, 3);
                    document.getElementById("t_nro_ctrc").value = e.target.innerHTML.substring(3, 9);
                    document.getElementById('2').dispatchEvent(event);
                }
            }
            return;

        });




        // mostra os 20 ultimos CTes consultados
        var node1 = document.createElement("div")
        document.getElementById("frm").append(node1)
        node1.setAttribute("style", "left:870px;top:50px;")
        var node2 = document.createElement("ul")
        node1.appendChild(node2)
        var aa = document.getElementsByTagName("a")
        var arr_ctrc = []
        if (getCookie('lista_ctrc') == "") {} else {
            arr_ctrc = JSON.parse(getCookie('lista_ctrc'))
            //console.log(arr_ctrc)
        }
        for (i = 0; i < arr_ctrc.length; i++) {
            texto = document.createTextNode(arr_ctrc[i])
            li = document.createElement("li")
            li.appendChild(texto)
            node2.appendChild(li)
        }



        for (i = 0; i < aa.length; i++) {
            if (i % 2 != 0 && i <= 22) {
                aa[i].addEventListener('click', function(e) {
                    //console.log(e.target.id)
                    for (j = 0; j < document.getElementsByTagName("li").length; j++) {
                        document.getElementsByTagName("li")[j].classList.remove("red");
                    }
                    retorno = gravar(e.target.id)
                    if (retorno == arr_ctrc[arr_ctrc.length - 1]) {

                    } else {
                        texto = document.createTextNode(retorno)
                        li = document.createElement("li")
                        li.setAttribute("class", "red")
                        li.appendChild(texto)
                        node2.appendChild(li)
                        arr_ctrc.push(retorno)
                        if (arr_ctrc.length > 20) {
                            //console.log("tam: "+arr_ctrc.length)
                            arr_ctrc.shift()
                        }
                        setCookie("lista_ctrc", JSON.stringify(arr_ctrc), 365)
                    }
                });

            }
        }


        document.getElementById('t_nro_ctrc').addEventListener('focusout', (e) => {
            for (j = 0; j < document.getElementsByTagName("li").length; j++) {
                document.getElementsByTagName("li")[j].classList.remove("red");
            }
            retorno = gravar(2)
            if (retorno == arr_ctrc[arr_ctrc.length - 1]) {} else {
                texto = document.createTextNode(retorno)
                li = document.createElement("li")
                li.setAttribute("class", "red")
                li.appendChild(texto)
                node2.appendChild(li)
                arr_ctrc.push(retorno)
                if (arr_ctrc.length > 20) {
                    //console.log("tam: "+arr_ctrc.length)
                    arr_ctrc.shift()
                }
                setCookie("lista_ctrc", JSON.stringify(arr_ctrc), 365)
            }
        });

        setInterval(function() {
            if (getCookie('attm') == 'atualizar') {
                location.reload();
                setCookie('attm', '', -2);
            }
        }, 2500);

        function segundoXML() {

            grupo = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.length - 2);
            tabela2 = document.createElement('table');
            tabela2.setAttribute('id', 'tabela2')
            tabela2.setAttribute('style', 'margin-top:20px;')
            document.getElementById('divTabela').append(tabela2)

            if (grupo == "9" || grupo == '18' || grupo == "38" || grupo == "52" || grupo == "09" ||  grupo == '7' || grupo == '07' || usuario == 'jheniffe') {

                xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        estilo = ' style="cursor: pointer; background: rgb(255, 255, 255); position: relative; text-decoration: none;" ';
                        myObj = this.responseText;
                        console.log(myObj)
                        y = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
                        html2 = '';
                        if (y.length > 0) {
                            html2 += '<tr class="srtr2" style="cursor: default;">';
                            html2 += '<td class="srtit2"><div class="srdvl"><a class="srtit2">CTRC/Fatura</a></div></td>';
                            html2 += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Cliente</a></div></td>';
                            html2 += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Identificador</a></div></td>';
                            html2 += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Solicitado</a></div></td>';
                            html2 += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Por</a></div></td>';
                            html2 += '</tr>';
                        }
                        ndescon = y.length;
                        for (var i = 0; i < y.length; i++) {

                            cor = i % 2 == 0 ? '" bg="#ffffff" ' : '" bg="#eeeeee" ';
                            html2 += '<tr class="srtr2"' + cor + estilo + '>';
                            html2 += '<td class="srtd2"><div class="srdvl" id="d' + i + '">' + y[i].ctrc_fatura + '</div></td>';
                            html2 += '<td class="srtd2">' + y[i].nome_cliente + '</td>';
                            html2 += '<td class="srtd2">Pedido de Desconto</td>';
                            html2 += '<td class="srtd2">' + y[i].data_solicitacao + '</td>';
                            html2 += '<td class="srtd2">' + y[i].usuario_solicitante + '</td>';
                            html2 += '</tr>';
                        }
                        document.getElementById('tabela2').innerHTML += html2;
                    }

                }

                xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=101_descontos", true);
                xmlhttp.send
            }

            var table2 = document.getElementById('tabela2');
            table2.addEventListener('click', function(e) {
                if (e.target.nodeName.toUpperCase() == "DIV") {
                    if (e.target.id) {
                        document.getElementById("t_ser_ctrc").value = e.target.innerHTML.substring(0, 3);
                        document.getElementById("t_nro_ctrc").value = e.target.innerHTML.substring(3, 9);
                        document.getElementById('2').click();
                    }
                }
                return;
            });

        }
        usuario = getCookie('login');
        if (usuario == 'marianny' || usuario == 'bruno' || usuario == 'jessica' || usuario == 'rosilene' || usuario == 'rosi' || usuario == 'andressa' || usuario == 'jheniffe' || usuario == 'artur') {
            link_descontos = document.createElement('a');
            link_descontos.setAttribute('href', 'https://sswresponse.azurewebsites.net/relatorio.php?auth=descontos')
            link_descontos.setAttribute('style', 'font-family:verdana;font-size:10px;')
            link_descontos.style.left = '100px';
            link_descontos.style.top = '320px';
            link_descontos.innerText = 'Consultar Pedidos de Descontos';
            document.body.append(link_descontos)
        }

        xmlhttp = new XMLHttpRequest(); //EXIBE TABELA COM CTES EM ACOMPANHAMENTO
        xmlhttp.onreadystatechange = function() {
            var aguardando = [];
            var em_analise = [];
            if (this.readyState == 4 && this.status == 200) {
                estilo = ' style="cursor: pointer; background: rgb(255, 255, 255); position: relative; text-decoration: none;" ';
                myObj = this.responseText;
                console.log(myObj)
                x = JSON.parse(myObj); //x[0].cte x[0].rem x[0].dest
                html = '';
                html += '<tr class="srtr2" style="cursor: default;">';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">CTe</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Remetente</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Destinatario</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Identificador</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Observação</a></div></td>';
                html += '<td class="srtit2"><div class="srdvl"><a class="srtit2">Remover</a></div></td>';
                html += '</tr>';
                for (var i = 0; i < x.length; i++) {
                    cor = i % 2 == 0 ? '" bg="#ffffff" ' : '" bg="#eeeeee" ';
                    html += '<tr class="srtr2" id="linha' + (i + 1) + '" ' + cor + estilo + '>';
                    html += '<td class="srtd2"><div class="srdvl" id="cte' + (i + 1) + '">' + x[i].cte + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl">' + x[i].rem + '</div></td>';
                    html += '<td class="srtd2"><div class="srdvl">' + x[i].dest + '</div></td>';
                    if (x[i].identificador == "SAC - Nao Resolvido") {
                        html += '<td class="srtd2"><div class="srdvl">' + x[i].identificador + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl"></div></td>';
                        html += '<td class="srtd2"><div class="srdvl"><a href="#" id="asd' + i + '" class="imglnk sac" style="position:relative;" >&nbsp;►&nbsp;</a></div></td>';
                    } else if (x[i].identificador == 'cvlHoje' || x[i].identificador == 'cvlTra') {
                        html += '<td class="srtd2"><div class="srdvl">' + x[i].identificador.substr(3) + ' - ' + x[i].status + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl"></div></td>';
                        html += '<td class="srtd2"><div class="srdvl"><a href="#" id="asd' + i + '"class="imglnk remover" style="position:relative;">&nbsp;×&nbsp;</a></div></td>';
                    } else if (x[i].identificador == 'Acompanhar') {
                        html += '<td class="srtd2"><div class="srdvl">' + x[i].identificador + '</div></td>';
                        html += '<td class="srtd2"><div id="obs' + (i + 1) + '" class="srdvl">' + x[i].obs + '</div></td>';
                        html += '<td class="srtd2"><div class="srdvl"><a href="#" id="asd' + i + '"class="imglnk remover" title="Remover" style="position:relative;">&nbsp;×&nbsp;</a></div></td>';
                    }
                    html += '</tr>';
                }
                document.getElementById('tabela').innerHTML = html;
                segundoXML();
            }
        }
        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=op101_1&usuario=" + usuario + "&dominio=" + dominio, true);
        xmlhttp.send();


        //EXIBE TABELA COM SOLICITAÇÕES DE DESCONTO PARA O GRUPO 9 e 38



    }



    //FUNC: NOVAS FUNC OP 101 (DENTRO DO CTE)
    //Tela na opcao 101, quando seleciona algum CTE, onde novos links sao criados
    //Adicionar carregamento prioridede CVL HOJE, TRA
    //Acompanhar CTe
    //Liberar para TODOS
    function op101_2_geral() {
        var node, node2, texto;
        var cte, rem, dest, unid, peso, usuario, arr_motivo, arr_contato, classe_arr, cliente, d, uni_dest, dominio;
        arr_contato = ['Telefone', 'E-mail', 'Chat', 'Fale Conosco SSW', 'Reclame Aqui'];
        arr_motivo = ['Agregar Veículo', 'Alteração / Complemento endereço', 'Auxílio Rastreamento site CVL', 'Cliente retira no depósito', 'Coletas', 'Contatos de unidade CVL', 'Cotação', 'Currículo', 'Dúvidas Fiscais', 'Horário de funcionamento', 'Informações Diversas', 'Manutenção de Cadastro', 'Mercadoria aguardando liberação fiscal', 'Mercadoria aguardando quitação do frete', 'Mercadoria com pendência', 'Posição de entrega – Carga atrasada ', 'Posição de entrega – Demora no retorno da pendência', 'Posição de entrega – Dificuldade em rastrear via site', 'Posição de entrega – Mercadoria descarregada', 'Posição de entrega – Mercadoria em rota de entrega', 'Posição de entrega – Mercadoria em trânsito', 'Posição de entrega – Mercadoria Entregue', 'Posição de entrega – Previsão de embarque', 'Posição de entrega – Promessa de entrega antes do prazo', 'Posição de entrega – Tempo de entrega Parceiros x CVL', 'Praças de Atendimento CVL / Prazos', 'Prioridade na Entrega', 'Rastreamento – CNPJ ou CPF não localizado', 'Rastreamento – Nota fiscal não localizada', 'Reclamação ', 'Retorno ao cliente', 'Reversão de Frete', 'Solicitação de Boleto / Atualização', 'Solicitação de Comprovante de Entrega - Via E-mail', 'Solicitação XML / Dacte', 'Tipo de mercadoria para transporte'];
        arr_hoje = ['BBR', 'TSE', 'CAC', 'MDT', 'JAC', 'ROO', 'PVL', 'CPV', 'NVT', 'DIA', 'NBR', 'LRV'];
        usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0') + 4, document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
        cte = document.getElementById("frm").getElementsByClassName("data")[2].innerText;
        peso = document.getElementById("frm").getElementsByClassName("data")[18].innerText;
        rem = document.getElementById("frm").getElementsByClassName("data")[29].innerText;
        dest = document.getElementById("frm").getElementsByClassName("data")[30].innerText;
        unid = document.getElementById("frm").getElementsByClassName("data")[42].innerText;
        dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim();
        //link HOJE
        uni_dest = document.getElementsByClassName('data')[3].innerText.substr(0, 3)

        if (dominio == 'OTC') {

            //verifica se o destino é um das cidades atendidas pelo Hoje
            if (arr_hoje.indexOf(document.getElementsByClassName('data')[3].innerText.substr(0, 3)) > 0) {
                //se pertence a alguma unidade do hoje como destino, libera o link
                console.log('unid_dest: ' + document.getElementsByClassName('data')[3].innerText.substr(0, 3))

                node = document.createElement("a");
                node.setAttribute("id", "link_hoje");
                node.setAttribute("onfocus", "obj=this;");
                node.setAttribute("style", "left:448px; top:720px;");
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("CVL Hoje");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);
                document.getElementById("link_hoje").addEventListener("click", function() {

                    //verifica se a mercadoria esta em CGB ou CGR   
                    var data_ini_inf, data_fin_inf, seq_ctrc, pp, uu;

                    data_ini_inf = document.getElementById('data_ini_inf').value
                    data_fin_inf = document.getElementById('data_fin_inf').value
                    seq_ctrc = document.getElementById('seq_ctrc').value
                    g_ctrc_ser_ctrc = document.getElementById('g_ctrc_ser_ctrc').value
                    g_ctrc_nro_ctrc = document.getElementById('g_ctrc_nro_ctrc').value

                    pp = "act=O&local=Q&data_ini_inf=" + data_ini_inf + "&data_fin_inf=" + data_fin_inf + "&seq_ctrc=" + seq_ctrc + "&FAMILIA=&dummy=1589030146905"
                    uu = "ssw0053"

                    enviaAjax(uu, pp, function(x) {
                        x = x.substring(x.indexOf("<rs>"), x.indexOf("</rs>"))
                        x = (x.indexOf('Chegada na unidade CUIABA') > 0)
                        if (x) {
                            var data = new Date();
                            console.log('Mercadoria esta em CUIABA, salvando')
                            data = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
                            obj = {
                                cte: cte,
                                peso: peso,
                                rem: rem,
                                dest: dest,
                                unid: unid,
                                usuario: usuario,
                                identificador: "cvlHoje",
                                data: data,
                                dominio: dominio
                            };
                            salva_bd(obj, "op101_2");
                        } else {
                            alert("Mercadoria nao deu chegada em Cuiaba ainda")
                        }
                    });



                });
            }


            //link TRA
            node = document.createElement("a");
            node.setAttribute("id", "link_tra");
            node.setAttribute("onfocus", "obj=this;");
            node.setAttribute("style", "left:550px; top:720px;");
            node.setAttribute("class", "baselnk");
            node.setAttribute("href", "#");
            texto = document.createTextNode("Transhorario");
            node.appendChild(texto);
            document.getElementById("frm").appendChild(node);
            document.getElementById("link_tra").addEventListener("click", function() {
                var data = new Date();
                data = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
                obj = {
                    cte: cte,
                    peso: peso,
                    rem: rem,
                    dest: dest,
                    unid: unid,
                    usuario: usuario,
                    identificador: "cvlTra",
                    data: data,
                    dominio: dominio
                };
                salva_bd(obj, "op101_2");

            });
        }



        //cria campo "observação"
        node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('id', 'campo_observacao');
        node.setAttribute('name', 'obs');
        node.setAttribute('placeholder', "Insira uma observação...");
        node.setAttribute('style', 'width:200px; padding:5px; left:450px; top:560px; visibility:hidden;');
        document.getElementById('frm').appendChild(node);

        //botão para liberar campo "observação"
        node = document.createElement('a');
        node.setAttribute('id', 'link_observacao');

        node.setAttribute('style', 'left:632px; top:720px');
        node.setAttribute('class', 'baselnk');
        node.setAttribute('href', '#');
        texto = document.createTextNode('Acompanhar CTe');
        node.appendChild(texto);
        document.getElementById('frm').appendChild(node);
        document.getElementById('link_observacao').addEventListener('click', function() {
            document.getElementById('link_acompanhar').style = 'left:732px; top:560px; visibility:visible';
            document.getElementById('campo_observacao').style = 'width:150px; padding:5px; border:1px solid black; left:560px; top:560px; visibility:visible';
            this.style = 'visibility:hidden;';
        });

        //link Acompanhar CTE
        node = document.createElement("a");
        node.setAttribute("id", "link_acompanhar");
        node.setAttribute("onfocus", "obj=this;");
        node.setAttribute("style", "left:732px; top:560px; visibility:hidden");
        node.setAttribute("class", "baselnk");
        node.setAttribute("href", "#");
        texto = document.createTextNode("Acompanhar CTe");
        node.appendChild(texto);
        document.getElementById("frm").appendChild(node);
        document.getElementById("link_acompanhar").addEventListener("click", function() {
            obs = document.getElementById('campo_observacao').value;
            obj = {
                cte: cte,
                peso: peso,
                rem: rem,
                dest: dest,
                unid: unid,
                usuario: usuario,
                identificador: "acompanhar",
                dominio: dominio,
                obs: obs
            };
            salva_bd(obj, "op101_2");
            setCookie('attm', 'atualizar', 365)
            setTimeout(function() {
                window.close();
            }, 2000);

        });


        //media Kg no CTe e %
        valor1 = parseFloat(document.getElementsByClassName('data')[24].innerText.replace('.', '').replace(',', '.') / document.getElementsByClassName('data')[17].innerText.replace('.', '').replace(',', '.')).toFixed(2).replace('.', ',')
        valor2 = parseFloat((document.getElementsByClassName('data')[24].innerText.replace('.', '').replace(',', '.') / document.getElementsByClassName('data')[22].innerText.replace('.', '').replace(',', '.')) * 100).toFixed(2).replace('.', ',')

        node = document.createElement('div');
        node.setAttribute("style", "left:252px;top:208px;width:115px;background-color:wheat");
        node.setAttribute("class", "texto");
        node.setAttribute("id", "mdkg");
        texto = document.createTextNode("R$ / kg (R$): " + valor1);
        node.appendChild(texto);
        document.getElementById("frm").appendChild(node);

        node = document.createElement('div');
        node.setAttribute("style", "left:252px;top:224px;width:115px;background-color:wheat");
        node.setAttribute("class", "texto");
        node.setAttribute("id", "perc");
        texto = document.createTextNode("% sob NF (%): " + valor2);
        node.appendChild(texto);
        document.getElementById("frm").appendChild(node);


    }

    //FUNC: CLIENTE RETIRA - NOVAS FUNC OP 101 (DENTRO DO CTE) 
    //Adicionar cliente retira a partir da tela do CTe direto
    //Liberar para Recepcao 05
    function op101_2_retira() {
        chrome.storage.local.get(['permissao'], function(result) {
            permissao = result.permissao.split(',');
            console.log(permissao);
            dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim();
            if (permissao.includes('op101_2_retira') && dominio == 'OTC') {

                var node, node2, texto;
                var cte, rem, dest, unid, peso, usuario, arr_motivo, arr_contato, classe_arr, cliente, d;

                usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0') + 4, document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
                cte = document.getElementById("frm").getElementsByClassName("data")[2].innerText;
                dest = document.getElementById("frm").getElementsByClassName("data")[32].innerText;
                vol = document.getElementById("frm").getElementsByClassName("data")[11].innerText;

                //link Cliente Retira
                node = document.createElement("a");
                node.setAttribute("id", "link_retira");
                node.setAttribute("onfocus", "obj=this;");
                node.setAttribute("style", "left:768px; top:720px;");
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("Cliente Retira");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);

                document.getElementById("link_retira").addEventListener("click", function() {
                    var vis;
                    vis = document.getElementsByClassName("retira")[0].style.visibility == 'hidden' ? 'visible' : 'hidden'
                    classe_arr = document.getElementsByClassName("retira");
                    for (var i = 0; i < classe_arr.length; i++) {
                        classe_arr[i].style.visibility = vis;
                    }
                    if (document.getElementsByClassName("sac")) {
                        classe_arr = document.getElementsByClassName("sac");
                        for (var i = 0; i < classe_arr.length; i++) {
                            classe_arr[i].style.visibility = "hidden";
                        }
                    }
                    /*
                    
                    classe_arr = document.getElementsByClassName("fiscalcvl");
                    for (var i = 0; i < classe_arr.length; i++) {
                        classe_arr[i].style.visibility="hidden";
                    }
                    */
                });

                //popup cliente retira - OK funcionando
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto retira");
                node2.setAttribute("style", "left:530px; top: 576px;text-align:left;");
                texto = document.createTextNode("Cliente Retira:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                node2 = document.createElement("input");
                node2.setAttribute("type", "text");
                node2.setAttribute("name", "nome");
                node2.setAttribute("style", "left:624px;top:576px;");
                node2.setAttribute("id", "nome_retira");
                node2.setAttribute("class", "retira");
                document.getElementById("frm").appendChild(node2);

                //popup cliente retira - OK funcionando
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto retira");
                node2.setAttribute("style", "left:530px; top: 592px;text-align:left;");
                texto = document.createTextNode("Tipo Mercadoria:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                node2 = document.createElement("input");
                node2.setAttribute("type", "text");
                node2.setAttribute("name", "nome");
                node2.setAttribute("style", "left:624px;top:592px;");
                node2.setAttribute("id", "tipo_mercadoria");
                node2.setAttribute("class", "retira");
                document.getElementById("frm").appendChild(node2);

                //link para salvar
                node2 = document.createElement("a");
                node2.setAttribute("id", "envia_retira");
                node2.setAttribute("onfocus", "obj=this;");
                node2.setAttribute("style", "left:830px;top:592px;");
                node2.setAttribute("class", "imglnk retira");
                node2.setAttribute("href", "#");
                texto = document.createTextNode("►");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                classe_arr = document.getElementsByClassName("retira");
                for (var i = 0; i < classe_arr.length; i++) {
                    classe_arr[i].style.visibility = "hidden"
                }

                document.getElementById("envia_retira").addEventListener("click", function() {

                    const socket = io.connect("https://nodeservercvl.azurewebsites.net");

                    cnpj = document.getElementById("link_cli_dest").text;
                    nome_cliente = document.getElementById("nome_retira").value;
                    tipo_mercadoria = document.getElementById("tipo_mercadoria").value;
                    nfe = document.getElementsByClassName('data')[8].innerText;
                    praca = document.getElementsByClassName('data')[32].innerText;

                    data_ini_inf = document.getElementById('data_ini_inf').value
                    data_fin_inf = document.getElementById('data_fin_inf').value
                    seq_ctrc = document.getElementById('seq_ctrc').value
                    g_ctrc_ser_ctrc = document.getElementById('g_ctrc_ser_ctrc') == null ? "" : document.getElementById('g_ctrc_ser_ctrc').value
                    g_ctrc_nro_ctrc = document.getElementById('g_ctrc_nro_ctrc') == null ? "" : document.getElementById('g_ctrc_nro_ctrc').value
                    uu = "ssw0053"
                    pp = "act=SSWBAR&g_ctrc_ser_ctrc=" + g_ctrc_ser_ctrc + "&g_ctrc_nro_ctrc=" + g_ctrc_nro_ctrc + "&gw_nro_nf_ini=0&g_ctrc_nf_vol_ini=0&gw_ctrc_nr_sscc=&g_ctrc_nro_ctl_form=0&gw_ctrc_parc_nro_ctrc_parc=0&g_ctrc_c_chave_fis=&local=Q&data_ini_inf=" + data_ini_inf + "&data_fin_inf=" + data_fin_inf + "&seq_ctrc=" + seq_ctrc + "&FAMILIA=OTC&dummy=1608515229823"
                    enviaAjax(uu, pp, function(x) {
                        //console.log(x)

                        end = x.substring(x.indexOf("<f4>") + 4, x.indexOf("</f4>"))
                        console.log(end)
                        socket.emit("novo", nome_cliente, cte, cnpj, "1-Nova solicitação de retirada", "false", usuario, dest, nfe, praca, "Qtda: " + vol + "  - Merc: " + tipo_mercadoria + " - End: " + end);

                        document.getElementById("nome_retira").value = "";

                        classe_arr = document.getElementsByClassName("retira");
                        for (var i = 0; i < classe_arr.length; i++) {
                            classe_arr[i].style.visibility = "hidden"
                        }
                    });

                });
            }
        });
    }


    function op102() {

        usuario = getCookie('login');
        if (usuario == 'marianny' || usuario == 'bruno' || usuario == 'jessica' || usuario == 'rosilene' || usuario == 'andressa' || usuario == 'jheniffe' || usuario == 'artur') {
            link_tabelas = document.createElement('a');
            link_tabelas.setAttribute('href', 'https://sswresponse.azurewebsites.net/relatorio.php?auth=tabelas')
            link_tabelas.setAttribute('style', 'font-family:verdana;font-size:10px;')
            link_tabelas.style.left = '36px';
            link_tabelas.style.top = '260px';
            link_tabelas.innerText = 'Consultar todos os cadastros de tabela';
            document.body.append(link_tabelas)
        }

        document.getElementById('cnpj_cliente').value = '';
        document.getElementById('cnpj_cliente').blur();
        document.getElementById('cnpj_cliente').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            novadata = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('cnpj_cliente').value = novadata;
        });
        document.getElementById('numero_cnpj_grupo').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('numero_cnpj_grupo').value = pastedData;
        });
        document.getElementById('numero_cnpj_raiz').addEventListener('paste', (e) => { //altera o ctrl+v do campo de cnpj
            e.stopPropagation();
            e.preventDefault();
            var clipboardData, pastedData;
            clipboardData = e.clipboardData || window.clipboardData;
            pastedData = clipboardData.getData('Text');
            pastedData = pastedData.replaceAll('.', '').replaceAll('-', '').replaceAll('/', '')
            document.getElementById('numero_cnpj_raiz').value = pastedData;
        });


        var node1 = document.createElement("div"); /*Cria div e inicializa array de cnpjs*/
        document.getElementById("frm").append(node1)
        node1.setAttribute("style", "left:800px;top:50px");
        var node2 = document.createElement("ul");
        node1.appendChild(node2)
        var arr_cnpj = []
        console.log(getCookie('listacnpj'))
        if (getCookie('listacnpj') == "") {} else {
            arr_cnpj = JSON.parse(getCookie('listacnpj'))
        }
        for (i = 0; i < arr_cnpj.length; i++) {
            /*Exibe cnpjs já consultados*/
            texto = document.createTextNode(arr_cnpj[i])
            li = document.createElement("li")
            li.appendChild(texto)
            node2.appendChild(li)
        }

        function exibeCNPJ(cod) {
            /* Exibe o último cnpj consultado*/
            for (j = 0; j < document.getElementsByTagName("li").length; j++) {
                document.getElementsByTagName("li")[j].classList.remove("red");
            }
            retorno = gravar(cod) /* Não exibe o mesmo cnpj duas vezes seguidas*/
            if (retorno == arr_cnpj[arr_cnpj.length - 1]) {

            } else {
                texto = document.createTextNode(retorno)
                li = document.createElement('li')
                li.setAttribute("class", "red")
                li.appendChild(texto)
                node2.appendChild(li)
                arr_cnpj.push(retorno)
                if (arr_cnpj.length > 10) {
                    arr_cnpj.shift()
                }
                setCookie("listacnpj", JSON.stringify(arr_cnpj), 365)
            }

        }
        document.getElementById("btn_env_cnpj_cliente").addEventListener('click', () => {
            exibeCNPJ(23)
        });
        document.getElementById("btn_env_cnpj_grupo").addEventListener('click', () => {
            exibeCNPJ(24)
        });
        document.getElementById("btn_env_cnpj_raiz").addEventListener('click', () => {
            exibeCNPJ(25)
        });
        document.getElementById('cnpj_cliente').addEventListener('focusout', () => {
            exibeCNPJ(23)
        });
        document.getElementById('numero_cnpj_grupo').addEventListener('focusout', () => {
            exibeCNPJ(24)
        });
        document.getElementById('numero_cnpj_raiz').addEventListener('focusout', () => {
            exibeCNPJ(25)
        });



    }


    //FUNC: ATENDIMENTO SAC 
    //Gerar relatorio dos atendimentos feitos pela SAC
    //Liberar para SAC e NCE 39
    function op101_2_sac(menu) {
        chrome.storage.local.get(['permissao'], function(result) {
            permissao = result.permissao.split(',');
            dominio = document.getElementsByClassName("texto3")[0].innerText.indexOf("Domínio") >= 0 ? document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim() : document.getElementsByClassName("texto3")[0].innerText.substring(0, document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0')).trim();
            if (permissao.includes('op101_2_sac') && (dominio == 'OTC' || dominio == 'GEN')) {

                var node, node2, texto, vis;
                var cte, rem, dest, unid, peso, usuario, arr_motivo, arr_contato, classe_arr, cliente, d, style;

                arr_contato = ['Telefone', 'E-mail', 'Chat/WhatsApp', 'Fale Conosco SSW', 'Reclame Aqui', 'FB / Instagram'];
                arr_motivo = ['1 - Rastreamento (previsão / posição de entrega ou embarque)', '2 - Cliente retira no depósito', '3 - Coletas', '4 - Contatos de unidade CVL', '5 - Cotação/Comercial', '6 - Dúvidas Gerais/ Informações diversas', '7 - Alteração de Cadastro/Mudança do endereço de entrega', '8 - Mercadoria aguardando quitação do frete', '9 - Praças de Atendimento CVL / Prazos', '10 - Rastreamento – CNPJ ou CPF não localizado', '11 - Rastreamento – Nota fiscal não localizada', '12 - Reclamação ', '13 - Reversão de Frete', '14 - Solicitação de Boleto / Atualização', '15 - Solicitação de Comprovante de Entrega', '16 - Solicitação XML / Dacte/ EDI', '17 - Elogio'];

                //opc101_1,opc101_2,opc101_ocorrencia,opc102
                //link de acesso, posição inicial do texto, //link de acesso, posição inicial do campo

                style = {
                    'opc101_1': ['left:450px;top:144px;', 624, 544, "left:830px;top:608px;visibility:hidden;"],
                    'opc101_2': ['left:848px; top:720px;', 624, 544, "left:830px;top:608px;visibility:hidden;"],
                    'opc101_3': ['left: 270px;top: 368px;', 850, 192, "visibility:hidden;"],
                    'opc102': ['left: 36px;top: 244px;', 120, 250, "left:325px;top:346px;visibility:hidden;"]
                }

                //TODO: ao carregar, verificar antes se o CTe já esta sendo acompanhando ou nao

                //link Protocolo SAC
                node = document.createElement("a");
                node.setAttribute("id", "link_sac");
                node.setAttribute("onfocus", "obj=this;");
                //node.setAttribute("style", "left:848px; top:720px;");
                node.setAttribute("style", style[menu][0]);
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("Protocolo SAC");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);

                document.getElementById("link_sac").addEventListener("click", function() {
                    console.log("Clicado em protocolo")
                    vis = document.getElementsByClassName("sac")[0].style.visibility == 'hidden' ? 'visible' : 'hidden'

                    classe_arr = document.getElementsByClassName("sac");

                    for (var i = 0; i < classe_arr.length; i++) {
                        classe_arr[i].style.visibility = vis;
                    }
                    if (document.getElementsByClassName("retira")) {
                        classe_arr = document.getElementsByClassName("retira");
                        for (var i = 0; i < classe_arr.length; i++) {
                            classe_arr[i].style.visibility = "hidden";
                        }
                    }

                });
                /*
                //link Fiscal CVL
                node = document.createElement("a");
                node.setAttribute("id", "link_fiscal_cvl");
                node.setAttribute("onfocus", "obj=this;");
                node.setAttribute("style", "left:928px; top:720px;");
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("Fiscal CVL");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);
                document.getElementById("link_fiscal_cvl").addEventListener("click", function(){

                    classe_arr = document.getElementsByClassName("sac");
                    for (var i = 0; i < classe_arr.length; i++) {
                        classe_arr[i].style.visibility="hidden";
                    }
                    classe_arr = document.getElementsByClassName("fiscalcvl");
                    for (var i = 0; i < classe_arr.length; i++) {
                        classe_arr[i].style.visibility="visible";
                    }
                });
                */

                //fim dos links de acesso

                //TODO: resgatar se o CTe ja esta sendo acompanhando popup atendimento sac 

                node2 = document.createElement("div");
                node2.setAttribute("class", "texto sac");
                //node2.setAttribute("style", "left:624px; top: 544px;text-align:left;");
                node2.setAttribute("style", "left:" + style[menu][1] + "px; top:" + (style[menu][2] + 16 * 0) + "px;text-align:left;");
                texto = document.createTextNode("Contato:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                node2 = document.createElement("select");
                node2.setAttribute("id", "id_contato");
                //node2.setAttribute("style", "left:696px; top:544px;text-align:left;");
                node2.setAttribute("style", "left:" + (style[menu][1] + 72) + "px; top:" + (style[menu][2] + 16 * 0) + "px;text-align:left;");
                node2.setAttribute("name", "contato");
                node2.setAttribute("class", "nodata sac");
                document.getElementById("frm").appendChild(node2);

                for (var i = 0; i < arr_contato.length; i++) {
                    var option = document.createElement("option");
                    option.value = arr_contato[i];
                    option.text = arr_contato[i];
                    node2.appendChild(option);
                }

                //motivo
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto sac");
                node2.setAttribute("style", "left:" + style[menu][1] + "px; top:" + (style[menu][2] + 16 * 1) + "px;text-align:left;");
                texto = document.createTextNode("Motivo:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                node2 = document.createElement("select");
                node2.setAttribute("id", "id_motivo");
                node2.setAttribute("style", "left:" + (style[menu][1] + 72) + "px; top:" + (style[menu][2] + 16 * 1) + "px;text-align:left;");
                node2.setAttribute("name", "motivo");
                node2.setAttribute("class", "nodata sac");
                document.getElementById("frm").appendChild(node2);

                for (var i = 0; i < arr_motivo.length; i++) {
                    var option = document.createElement("option");
                    option.value = arr_motivo[i];
                    option.text = arr_motivo[i];
                    node2.appendChild(option);
                }

                //resolucao imediata
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto sac");
                node2.setAttribute("style", "left:" + style[menu][1] + "px; top:" + (style[menu][2] + 16 * 2) + "px;text-align:left;");
                texto = document.createTextNode("Resolvido:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                node2 = document.createElement("input");
                node2.setAttribute("type", "checkbox");
                node2.setAttribute("id", "res_imed");
                node2.setAttribute("style", "left:" + (style[menu][1] + 72) + "px; top:" + (style[menu][2] + 16 * 2) + "px;text-align:left;");
                node2.setAttribute("name", "res_imed");
                node2.setAttribute("class", "nodata sac");
                document.getElementById("frm").appendChild(node2);

                //cliente é rem ou dest
                //check rem
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto sac");
                node2.setAttribute("style", "left:" + style[menu][1] + "px; top:" + (style[menu][2] + 16 * 3) + "px;text-align:left;");
                texto = document.createTextNode("Remetente:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);
                node2 = document.createElement("input");
                node2.setAttribute("type", "radio");
                node2.setAttribute("id", "checkrem");
                node2.setAttribute("style", "left:" + (style[menu][1] + 72) + "px; top:" + (style[menu][2] + 16 * 3) + "px;text-align:left;");
                node2.setAttribute("name", "cliente_radio");
                node2.setAttribute("class", "nodata sac");
                document.getElementById("frm").appendChild(node2);
                //check dest
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto sac");
                node2.setAttribute("style", "left:" + style[menu][1] + "px; top:" + (style[menu][2] + 16 * 4) + "px;text-align:left;");
                texto = document.createTextNode("Destinatario:");
                node2.appendChild(texto);

                document.getElementById("frm").appendChild(node2);
                node2 = document.createElement("input");
                node2.setAttribute("type", "radio");
                node2.setAttribute("id", "checkdest");
                node2.setAttribute("style", "left:" + (style[menu][1] + 72) + "px; top:" + (style[menu][2] + 16 * 4) + "px;text-align:left;");
                node2.setAttribute("name", "cliente_radio");
                node2.setAttribute("class", "nodata sac");
                document.getElementById("frm").appendChild(node2);

                //nome cliente
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto sac");
                node2.setAttribute("style", "left:" + style[menu][1] + "px; top:" + (style[menu][2] + 16 * 5) + "px;text-align:left;");
                texto = document.createTextNode("Cliente:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                node2 = document.createElement("input");
                node2.setAttribute("type", "text");
                node2.setAttribute("name", "status");
                node2.setAttribute("style", "left:" + (style[menu][1] + 72) + "px;top:" + (style[menu][2] + 16 * 5) + "px;");
                node2.setAttribute("id", "cliente_sac");
                node2.setAttribute("class", "sac");
                document.getElementById("frm").appendChild(node2);

                //responsavel
                node2 = document.createElement("div");
                node2.setAttribute("class", "texto sac");
                node2.setAttribute("style", "left:" + style[menu][1] + "px; top:" + (style[menu][2] + 16 * 6) + "px;text-align:left;");
                texto = document.createTextNode("Responsavel:");
                node2.appendChild(texto);
                document.getElementById("frm").appendChild(node2);

                node2 = document.createElement("input");
                node2.setAttribute("type", "text");
                node2.setAttribute("name", "status");
                node2.setAttribute("style", "left:" + (style[menu][1] + 72) + "px;top:" + (style[menu][2] + 16 * 6) + "px;");
                node2.setAttribute("id", "resp_sac");
                node2.setAttribute("class", "sac");
                document.getElementById("frm").appendChild(node2);

                classe_arr = document.getElementsByClassName("sac");
                for (var i = 0; i < classe_arr.length; i++) {
                    classe_arr[i].style.visibility = "hidden"
                }

                usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0') + 4, document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();

                //link para salvar
                //se for dentro da ocorrencia, o botao de confirmar é o da insttrucao, se nao, tem que criar o botao de salvar
                if (menu == 'opc101_3') {

                    document.getElementById("12").addEventListener("click", function() {
                        console.log('clicou em salvar instrucao');
                        if (vis == "visible") { // se ja tiver clicado no link do protoclo, habilita par  savlar ,se nao nao
                            var data = new Date();
                            cte = document.getElementById("1").innerText;
                            rem = document.getElementById("frm").getElementsByClassName("data")[6].innerText.replace("'", "");
                            dest = document.getElementById("frm").getElementsByClassName("data")[7].innerText.replace("'", "");
                            data = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
                            contato = document.getElementById("id_contato").value;
                            motivo = document.getElementById("id_motivo").value;
                            resolvido = document.getElementById("res_imed").checked;
                            responsavel = document.getElementById("resp_sac").value;
                            protocolo = "0"; //fazer uma formula para o protocolo
                            nome_cliente = document.getElementById("cliente_sac").value;
                            cliente = document.getElementById("checkrem").checked ? rem : document.getElementById("checkdest").checked ? dest : "vazio";
                            datafinal = resolvido ? data : "";
                            obj = {
                                data: data,
                                usuario: usuario,
                                cliente: cliente,
                                cte: cte,
                                contato: contato,
                                motivo: motivo,
                                resolvido: resolvido,
                                responsavel: responsavel,
                                protocolo: protocolo,
                                nome: nome_cliente,
                                dominio: dominio,
                                datafinal: datafinal
                            };
                            salva_bd(obj, "sac");

                            classe_arr = document.getElementsByClassName("sac");
                            for (var i = 0; i < classe_arr.length; i++) {
                                classe_arr[i].style.visibility = "hidden"
                            }
                        }
                    });
                } else {
                    node2 = document.createElement("a");
                    node2.setAttribute("id", "envia_sac");
                    node2.setAttribute("onfocus", "obj=this;");
                    node2.setAttribute("style", style[menu][3]);
                    node2.setAttribute("class", "imglnk sac");
                    node2.setAttribute("href", "#");
                    texto = document.createTextNode("►");
                    node2.appendChild(texto);
                    document.getElementById("frm").appendChild(node2);

                    document.getElementById("envia_sac").addEventListener("click", function() {
                        var tela = document.getElementById("telaprog").textContent.substring(0, 10).trim();
                        if (tela == "ssw0054.19") {
                            //Dentro da opcao 102
                            cte = 'Não Localizado';
                            rem = 'Não Localizado';
                            dest = 'Não Localizado';
                        } else {
                            //nas outras opcoes
                            cte = document.getElementById("frm").getElementsByClassName("data")[2].innerText;
                            rem = document.getElementById("frm").getElementsByClassName("data")[29].innerText.replace("'", "");
                            dest = document.getElementById("frm").getElementsByClassName("data")[30].innerText.replace("'", "");
                        }

                        var data = new Date();
                        data = data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate() + " " + data.getHours() + ":" + data.getMinutes() + ":" + data.getSeconds();
                        contato = document.getElementById("id_contato").value;
                        motivo = document.getElementById("id_motivo").value;
                        resolvido = document.getElementById("res_imed").checked;
                        responsavel = document.getElementById("resp_sac").value;
                        protocolo = "0"; //fazer uma formula para o protocolo
                        nome_cliente = document.getElementById("cliente_sac").value;
                        cliente = document.getElementById("checkrem").checked ? rem : document.getElementById("checkdest").checked ? dest : "vazio";
                        datafinal = resolvido ? data : "";

                        obj = {
                            data: data,
                            usuario: usuario,
                            cliente: cliente,
                            cte: cte,
                            contato: contato,
                            motivo: motivo,
                            resolvido: resolvido,
                            responsavel: responsavel,
                            protocolo: protocolo,
                            nome: nome_cliente,
                            dominio: dominio,
                            datafinal: datafinal
                        };
                        salva_bd(obj, "sac");

                        classe_arr = document.getElementsByClassName("sac");
                        for (var i = 0; i < classe_arr.length; i++) {
                            classe_arr[i].style.visibility = "hidden"
                        }
                    });
                }
            }
        });
    }

    //FUNC: PI - Processo Interno Indenizacao 
    //Gerar proecsso interno para indenizacao
    //Liberar para SAC e NCE 39
    function op101_2_pi() {
        chrome.storage.local.get(['permissao'], function(result) {
            permissao = result.permissao.split(',');
            if (permissao.includes('op101_1_pi')) {
                node = document.createElement("a");
                node.setAttribute("id", "link_pi");
                node.setAttribute("onfocus", "obj=this;");
                node.setAttribute("style", "left:848px; top:720px;"); //rever posicao
                node.setAttribute("class", "baselnk");
                node.setAttribute("href", "#");
                texto = document.createTextNode("PI Interno");
                node.appendChild(texto);
                document.getElementById("frm").appendChild(node);
            }
        });
    }



    //FUNC: Opcao 88 
    //Mostrar somente as placas por pilotos
    //Liberar para ENTREGA/COLETA
    function op88() {
        chrome.storage.local.get(['permissao'], function(result) {

            permissao = result.permissao.split(',');
            dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim();
            //console.log('verificando permissao')
            if (permissao.includes('op88') && (dominio == 'OTC')) {
                //console.log('permissao ok')
                desenha_88();
                mostra_placas();
                document.getElementById("1").addEventListener("change", function() {
                    setTimeout(function() {
                        console.log('permissao ok - dentro do timeouy')
                        desenha_88();
                    }, 800)

                });
            }
        });
    }


    //FUNC: Opcao 4  
    //Emissao de declaração
    //Liberar para EXPEDICAO
    function declaracao() {
        usuario = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0') + 4, document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();
        dominio = document.getElementsByClassName("texto3")[0].children[0].children[0].innerText.trim();

        if (getCookie('permissao').includes('declaracao') && dominio == 'OTC') {

            el = crEl('div', 'declaracao', 'Declaracao:', 'texto', 'left:413px;top:96px;')
            document.getElementById('frm').append(el)
            el = crEl('input', 'declaracao_input', '', '', 'left:480px;top:96px;width:60px')
            document.getElementById('frm').append(el)
            el = crEl('div', 'retorno1', '', 'texto', 'left:950px;top:90px;text-align:rigth;')
            document.getElementById('frm').append(el)
            el = crEl('div', 'retorno2', '', 'texto', 'left:1095px;top:90px;text-align:left;')
            document.getElementById('frm').append(el)

            document.getElementById("declaracao_input").addEventListener("blur", function() {

                num_declaracao = document.getElementById('declaracao_input').value

                if (num_declaracao > 0) {

                    xmlhttp = new XMLHttpRequest();

                    xmlhttp.open("GET", "http://carvalimasisapi.carvalima.com.br:8082/api/cvldeclaracao?declaracaoid=" + num_declaracao, true);
                    //xmlhttp.setRequestHeader('Access-Control-Allow-Origin', 'sistema.ssw.inf.br');
                    //xmlhttp.setRequestHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
                    //xmlhttp.setRequestHeader('Content-Type', 'application/json'); //Obrigatorio API
                    //xmlhttp.setRequestHeader('Accept', '*/*');
                    xmlhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {

                            var event = new Event('change');
                            myObj = this.responseText;
                            x = JSON.parse(myObj);
                            var html1 = ''
                            var html2 = ''
                            for (var key in x[0]) {
                                if (x[0].hasOwnProperty(key)) {
                                    html1 += key + " :  - "
                                    html2 += x[0][key] + " - "
                                    //console.log(key + " : " + x[0][key]);
                                }
                            }
                            document.getElementById('retorno1').innerHTML = html1
                            document.getElementById('retorno2').innerHTML = html2
                            console.log(x)
                            //TODO: adicionar os dados direto nos campos e chamar as funcoes para pdorucar o cnpj
                            if (x[0].declaracao_Frete == null) {} else {
                                document.getElementById('16').value = x[0].declaracao_Frete == "CIF" ? '1' : '2'
                            }
                            if (x[0].remetente_Cpf_Cnpj == null) {} else {
                                document.getElementById('19').value = x[0].remetente_Cpf_Cnpj.replaceAll(".", "").replaceAll("-", "").trim()
                                document.getElementById('19').dispatchEvent(event);
                            }
                            if (x[0].destinatario_Cpf_Cnpj == null) {} else {
                                document.getElementById('41').value = x[0].destinatario_Cpf_Cnpj.replaceAll(".", "").replaceAll("-", "").trim()
                                document.getElementById('41').dispatchEvent(event);
                            }
                            if (x[0].pagador_Cpf_Cnpj == null) {} else {
                                document.getElementById('59').value = x[0].pagador_Cpf_Cnpj.replaceAll(".", "").replaceAll("-", "").trim()
                                document.getElementById('59').dispatchEvent(event);
                            }
                            document.getElementById('77').value = '244'
                            document.getElementById('77').dispatchEvent(event);
                            document.getElementById('79').value = '1'
                            document.getElementById('79').dispatchEvent(event);
                            document.getElementById('81').value = 'OUT'
                            document.getElementById('82').value = x[0].declaracao_Id
                            document.getElementById('82').dispatchEvent(event);
                            document.getElementById('85').value = '0,000'
                            document.getElementById('85').dispatchEvent(event);
                            if (x[0].declaracao_Volumes == null) {} else {
                                document.getElementById('169').value = parseFloat(x[0].declaracao_Volumes.replaceAll(",", ".")).toString().replaceAll('.', ',')
                                document.getElementById('169').dispatchEvent(event);
                            }
                            if (x[0].declaracao_Peso == null) {} else {
                                document.getElementById('170').value = parseFloat(x[0].declaracao_Peso.replaceAll(",", ".")).toString().replaceAll('.', ',')
                            }
                            document.getElementById('174').value = '100,00'
                            document.getElementById('198').value = "Id Declaracao: " + x[0].declaracao_Id + " Tel: " + x[0].destinatario_Telefone1 + " | " + x[0].destinatario_Telefone2
                            var obs = x[0].declaracao_Relacao_Bens.replaceAll("\r", " ").replaceAll("\n", "").trim()

                            if (obs.length > 90) {
                                obs1 = obs.substring(0, obs.substring(0, 90).lastIndexOf(" "))
                                obs2 = obs.substring(obs.substring(0, 90).lastIndexOf(" "))
                            } else {
                                obs1 = obs
                                obs2 = ""
                            }

                            document.getElementById('199').value = obs1
                            document.getElementById('200').value = obs2
                        }
                    }

                    xmlhttp.send();
                }

            });




            document.getElementById('59').addEventListener('blur', (e) => {
                if (document.getElementById('id_cli_des_bairro').value.includes('ESPIG') ||  document.getElementById('id_cli_des_bairro').value.includes('ESPE') || document.getElementById('id_cli_des_bairro').value.includes('NOVA UNIAO') || document.getElementById('id_cli_des_bairro').value.includes('COQUERAL')) {
                    document.getElementById('id_cli_des_bairro').style.backgroundColor = 'yellow'
                    document.getElementById('50').style.backgroundColor = 'yellow'

                    showmsg2('ATENCAO!! Bairro informado PODE ser um distrito que exija alteração da unidade de entrega.');

                    //setar o ID errorpanel para visivel
                    //setar o id erromsg com a mensagem de erro
                }
            })
            document.getElementById('19').addEventListener('blur', (e) => {
                document.getElementById('id_cli_des_bairro').style.backgroundColor = ''
                document.getElementById('50').style.backgroundColor = ''
            })
        }
    }


    function desenha_88() {

        //manobra feita para injetar o scrip na pagina para poder usar a funcao nativa da pagina { fillTable(0) }


        node = document.createElement("div");
        node.setAttribute("id", "div_link_selecao_placa");
        node.setAttribute("style", "left:852px; top: 112px; white-space: nowrap;width: 8px; overflow: visible;");
        //document.getElementById("frm").append(node);
        document.body.append(node);

        //link para verificar se tem novas coletas
        node = document.createElement("a");
        node.setAttribute("id", "link_selecao_placa");
        node.setAttribute("onfocus", "obj=this;");
        node.setAttribute("style", "position: absolute; right:0px;text-align:left; top:0px;");
        node.setAttribute("class", "baselnk");
        node.setAttribute("href", "#");
        texto = document.createTextNode("Selecionar placas");
        node.appendChild(texto);
        document.getElementById("div_link_selecao_placa").append(node);

        node = document.createElement("div")
        node.setAttribute("id", "divPlacas");
        node.setAttribute("style", "overflow:visible ;");
        document.getElementById("frm").append(node);

        document.getElementById("link_selecao_placa").addEventListener("click", function() {

            const injectedCode = `
            rpp = 100 //numero de veiculos por pagina
            totalid() // carrega os veiculos
            fillTable(0) //atualiza a pagina
            clearTimeout()
            `

            var script = document.createElement("script");
            script.textContent = injectedCode;
            (document.head).appendChild(script);

            var placas = getCookie("placas")

            var tag_veiculos = document.getElementsByTagName("table")[0].getElementsByTagName("tr");
            var veiculos = [];
            var i;
            for (i = 1; i < tag_veiculos.length; i++) {
                veiculos[i] = tag_veiculos[i].childNodes[2].innerText;
                var ele = document.createElement('input')
                ele.type = 'checkbox'
                ele.style.left = '800px'
                ele.style.top = '180'
                ele.setAttribute('class', 'selecaoPlacas')
                ele.id = 'idd' + veiculos[i]
                ele.name = ele.id
                //ele.checked = veiculos[i].includes(placas)?"true":"false"
                ele.style.top = (180 + 20 * i).toString() + 'px'
                var label = document.createElement('label')
                label.style.top = (180 + 20 * i).toString() + 'px'
                label.style.left = '820px'
                label.htmlFor = 'idd' + veiculos[i]
                var texto = document.createTextNode(veiculos[i])
                label.append(texto)
                document.getElementById("divPlacas").append(ele)
                document.getElementById("divPlacas").append(label)
            }

            node = document.createElement("div");
            node.setAttribute("id", "div_link_salva_placa");
            node.setAttribute("style", "left:952px; top: 112px; white-space: nowrap;width: 8px; overflow: visible;");
            document.body.append(node);

            //link para verificar se tem novas coletas
            node = document.createElement("a");
            node.setAttribute("id", "link_salva_placa");
            node.setAttribute("onfocus", "obj=this;");
            node.setAttribute("style", "position: absolute; right:0px;text-align:left; top:0px;");
            node.setAttribute("class", "baselnk");
            node.setAttribute("href", "#");
            texto = document.createTextNode("Salvar placas");
            node.appendChild(texto);
            document.getElementById("div_link_salva_placa").append(node);

            document.getElementById("link_salva_placa").addEventListener("click", function() {

                var placas = [];
                for (i = 0; i < document.getElementsByClassName('selecaoPlacas').length; i++) {
                    var id = document.getElementsByClassName('selecaoPlacas')[i].id
                    document.getElementById(id).checked ? placas.push(id.substr(3, 7)) : ""
                    document.getElementsByClassName('selecaoPlacas')[i].setAttribute("style", "display:none")
                }
                //console.log(placas);
                setCookie("placas", JSON.stringify(placas), 365)
                document.getElementById("divPlacas").setAttribute("style", "display:none;")

            });

        });



    }


    function mostra_placas() {

        const injectedCode = `
            rpp = 100 //numero de veiculos por pagina
            totalid() // carrega os veiculos
            fillTable(0) //atualiza a pagina
            clearTimeout()
            `

        var script = document.createElement("script");
        script.textContent = injectedCode;
        (document.head).appendChild(script);


        var placas = getCookie("placas")
        var nodes = document.getElementsByTagName("table")[0].firstElementChild.childNodes
        for (i = nodes.length - 1; i >= 0; i--) {
            if (i % 2 == 1) {
                if (placas.includes(nodes[i].childNodes[2].innerText)) {

                } else {
                    //console.log("removendo: "+nodes[i].childNodes[2].innerText)
                    nodes[i].remove()
                }
            }
        }
    }


    //FUNC: CHAT 
    //Chat interno
    //Liberar para Todos
    function chat() {

        node = document.createElement('div')
        node.setAttribute('class', 'aviso')
        node.setAttribute('id', 'chat')
        node.setAttribute('style', "left: 1020px;top: 94px;height: 520px;width: 450px;");
        document.getElementById('frm').append(node)
        node2 = document.createElement('ul')
        node2.setAttribute('class', 'messages')
        node.append(node2)
        node2 = document.createElement('input')
        node2.setAttribute('class', 'inputMessage')
        node2.setAttribute('id', 'chatInput')
        node2.setAttribute('style', "top: 506px;width: 450px;");
        node2.setAttribute('placeholder', 'Digite aqui')
        node.append(node2)

        node = document.createElement('div')
        node.setAttribute('class', 'texto')
        node.setAttribute('style', "left:670px;top:80px;width:782px;color:rgb(0,50,150);");
        document.getElementById('frm').append(node)
        node2 = document.createElement('b')
        node2.setAttribute('id', 'chat_titulo')
        text = document.createTextNode('Chat Interno - Para Avaliação')
        node2.append(text)
        node.append(node2)

        node = document.createElement('div')
        node.setAttribute('class', 'texto')
        node.setAttribute('style', "left:690px;top:620px;width:782px;color:rgb(0,50,150);");
        document.getElementById('frm').append(node)
        node2 = document.createElement('b')
        node2.setAttribute('id', 'chat_status')
        text = document.createTextNode('Status: ')
        node2.append(text)
        node.append(node2)

        node = document.createElement('div')
        node.setAttribute('class', 'texto')
        node.setAttribute('style', "left:490px;top:620px;width:782px;color:rgb(0,50,150);");
        document.getElementById('frm').append(node)
        node2 = document.createElement('b')
        node2.setAttribute('id', 'chat_fechar')
        text = document.createTextNode('FECHAR CHAT')
        node2.append(text)
        node.append(node2)

        document.getElementById('chat_fechar').addEventListener('click', function() {

        });

        $(function() {

            var FADE_TIME = 150; // ms
            var TYPING_TIMER_LENGTH = 400; // ms
            var COLORS = [
                '#e21400', '#91580f', '#f8a700', '#f78b00',
                '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
                '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
            ];
            var $window = document.getElementsByClassName('aviso')[1];
            //var username = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0'),document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim(); // Input for username
            var $messages = document.getElementsByClassName('messages')[0]; // Messages area
            var $inputMessage = document.getElementsByClassName('inputMessage')[0]; // Input message input box  

            var username;
            var connected = false;
            var typing = false;
            var lastTypingTime;
            var logado;

            //var $currentInput = $usernameInput.focus();

            //var socket = io('http://localhost:3000');
            //const socket = io.connect("https://nodeservercvl.azurewebsites.net");

            const addParticipantsMessage = (data) => {
                var message = '';
                if (data.numUsers === 1) {
                    message += "Temos 1 participante";
                } else {
                    message += "Agora temos " + data.numUsers + " participantes";
                }
                document.getElementById('chat_titulo').innerText = 'Chat Interno - Para Avaliação - Usuários: ' + data.numUsers;
                //log(message);
            }
            //TODO: fazer o login uma unica vez usar variavel do google

            chrome.storage.local.get(['logadoChat'], function(result) {
                logado = result.logadoChat;
                console.log('chorme storage logado:' + logado)
                if (!logado) {
                    console.log('nao esta logado');
                    chrome.storage.local.set({
                        'logadoChat': true
                    });
                    logado = true;
                    setUsername()

                }
            });


            const setUsername = () => {
                username = document.getElementsByClassName("texto3")[0].innerText.substring(document.getElementsByClassName("texto3")[0].innerText.indexOf('\u00A0'), document.getElementsByClassName("texto3")[0].innerText.lastIndexOf('\u00A0')).trim();

                // If the username is valid

                if (username) {

                    //$loginPage.fadeOut();
                    //$chatPage.show();
                    //$loginPage.off('click');
                    //$currentInput = $inputMessage.focus();
                    // Tell the server your username
                    socket.emit('add user', username);

                }


            }

            // Sends a chat message
            const sendMessage = () => {
                var message = document.getElementById('chatInput').value;
                // Prevent markup from being injected into the message
                //message = cleanInput(message);
                // if there is a non-empty message and a socket connection

                if (message && connected) {
                    document.getElementById('chatInput').value = '';
                    addChatMessage({
                        username: username,
                        message: message
                    });
                    // tell server to execute 'new message' and send along one parameter

                    socket.emit('new message', message);
                    //document.getElementById('chatInput').focus();
                }
            }

            // Log a message
            function log(message, options) {
                node = document.createElement('li')
                node.setAttribute('class', 'log')
                textnode = document.createTextNode(message)
                node.append(textnode)
                document.getElementsByClassName('messages')[0].append(node)
                document.getElementsByClassName('messages')[0].scrollTop = document.getElementsByClassName('messages')[0].scrollHeight
                /*
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
        */
                //document.getElementById('chatInput').focus();
            }

            // Adds the visual chat message to the message list
            function addChatMessage(data, options) {
                // Don't fade the message in if there is an 'X was typing'
                var $typingMessages = getTypingMessages(data);
                options = options || {};
                if ($typingMessages.length !== 0) {
                    options.fade = false;
                    $typingMessages.remove();
                }

                if (data.message[0] == '\\') {
                    console.log('funcao');
                    // \join roomname
                    /*
                    Entra na sala especifica e salva no cookie da extensao, qual a sala esta dentro, para recuperar depois quando fazer login e entrar automatico na sala
                    */
                    if (data.message.substr(0, 7) == '\\entrar') {
                        room = data.message.substr(8)
                        socket.emit('join room', room)
                        console.log('entrar: ' + room);
                        node = document.createElement('span');
                        node.setAttribute('class', 'room')
                        node.setAttribute('id', 'r' + room)
                        node.setAttribute('style', 'margin-left:10px;')
                        text = document.createTextNode(room);
                        node.append(text);
                        document.getElementById('chat').append(node);

                    } else if (data.message.substr(0, 5) == '\\sair') {
                        room = data.message.substr(6)
                        socket.emit('leave room', room)
                        console.log('funcao');
                        console.log('sair: ' + room);
                    } else {
                        //comando nao reconhecido
                    }
                }
                if (data.message[0] == '#') {
                    console.log('frase');
                    //todo: criar uma funcao que seleciona a mensagem com base no padrao #ummom -> um momento por favor
                }
                messageDiv = document.createElement('li');
                messageDiv.setAttribute('class', 'messages')
                document.getElementsByClassName('messages')[0].append(messageDiv)

                usernameDiv = document.createElement('span')

                usernameDivText = document.createTextNode(data.username + ':');
                usernameDiv.setAttribute('style', 'color:' + getUsernameColor(data.username));
                usernameDiv.append(usernameDivText)

                messageBodyDiv = document.createElement('span')
                messageBodyDiv.setAttribute('class', 'messageBody')
                messageBodyDivText = document.createTextNode(data.message);
                messageBodyDiv.append(messageBodyDivText)

                var typingClass = data.typing ? 'typing' : '';

                messageDiv.setAttribute('class', 'username ' + typingClass)
                messageDiv.append(usernameDiv)
                messageDiv.append(messageBodyDiv)
                document.getElementsByClassName('messages')[0].scrollTop = document.getElementsByClassName('messages')[0].scrollHeight


                /*
                var $usernameDiv = $('<span class="username"/>')
                .text(data.username)
                .css('color', getUsernameColor(data.username));
                var $messageBodyDiv = $('<span class="messageBody">')
                .text(data.message);

                var typingClass = data.typing ? 'typing' : '';
                var $messageDiv = $('<li class="message"/>')
                .data('username', data.username)
                .addClass(typingClass)
                .append($usernameDiv, $messageBodyDiv);

                addMessageElement($messageDiv, options);
                */
                //document.getElementById('chatInput').focus();
            }

            function addChatTyping(data) {
                data.typing = true;
                data.message = 'is typing';
                addChatMessage(data);
                //document.getElementById('chatInput').focus();
            }

            function removeChatTyping(data) {
                getTypingMessages(data).fadeOut(function() {
                    $(this).remove();
                });
                //document.getElementById('chatInput').focus();
            }


            // Updates the typing event
            const updateTyping = () => {
                if (connected) {
                    if (!typing) {
                        typing = true;
                        socket.emit('typing');
                    }
                    lastTypingTime = (new Date()).getTime();

                    setTimeout(() => {
                        var typingTimer = (new Date()).getTime();
                        var timeDiff = typingTimer - lastTypingTime;
                        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                            socket.emit('stop typing');
                            typing = false;
                        }
                    }, TYPING_TIMER_LENGTH);
                }
                //document.getElementById('chatInput').focus();
            }

            // Gets the 'X is typing' messages of a user TODO: tem erro aqui
            const getTypingMessages = (data) => {
                return $('.typing.message').filter(function(i) {
                    return $(this).data('username') === data.username;
                });
                //document.getElementById('chatInput').focus();
            }

            // Gets the color of a username through our hash function
            const getUsernameColor = (username) => {
                // Compute hash code
                var hash = 7;
                for (var i = 0; i < username.length; i++) {
                    hash = username.charCodeAt(i) + (hash << 5) - hash;
                }
                // Calculate color
                var index = Math.abs(hash % COLORS.length);
                return COLORS[index];
                //document.getElementById('chatInput').focus();
            }

            document.getElementById('chatInput').addEventListener("keypress", event => {
                // Auto-focus the current input when a key is typed
                /*
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
        }
        */
                // When the client hits ENTER on their keyboard
                if (event.keyCode === 13) {
                    //console.log('user: '+username+' logado: '+logado)
                    if (username && logado) {
                        //console.log('user e logado, ok')
                        sendMessage();
                        socket.emit('stop typing');
                        typing = false;

                    }
                }
                setTimeout(function() {

                    document.getElementById('chatInput').focus();

                }, 20)

                //document.getElementById('chatInput').focus();
            });
            // Focus input when clicking on the message input's border
            $inputMessage.click(() => {
                //$inputMessage.focus();
            });


            // Socket events

            // Whenever the server emits 'login', log the login message
            
            socket.on('login', (data) => {
                connected = true;
                // Display the welcome message
                var message = "Bem vindo ao Chat – ";
                /*
        log(message, {
        prepend: true
        });
        */
                addParticipantsMessage(data);
                document.getElementById('chat_status').innerText = 'Status: conectado'
            });

            // Whenever the server emits 'new message', update the chat body
            socket.on('new message', (data) => {
                addChatMessage(data);
            });

            // Whenever the server emits 'user joined', log it in the chat body
            socket.on('user joined', (data) => {
                //log(data.username + ' joined');
                addParticipantsMessage(data);
            });

            // Whenever the server emits 'user left', log it in the chat body
            socket.on('user left', (data) => {
                //log(data.username + ' left');
                addParticipantsMessage(data);
                removeChatTyping(data);
            });

            // Whenever the server emits 'typing', show the typing message
            socket.on('typing', (data) => {
                //addChatTyping(data);

            });

            // Whenever the server emits 'stop typing', kill the typing message
            socket.on('stop typing', (data) => {
                //removeChatTyping(data);
            });

            socket.on('disconnect', () => {
                document.getElementById('chat_status').innerText = 'Status: desconectado'
                //log('voce se desconectou');
            });

            socket.on('reconnect', () => {
                document.getElementById('chat_status').innerText = 'Status: reconectado'
                //log('voce reconectou');
                if (username) {
                    socket.emit('add user', username);
                }
            });

            socket.on('reconnect_error', () => {
                document.getElementById('chat_status').innerText = 'Status: tentativa de conectar falhou'
                //log('tentativa de conectar falhou');

            });
        });

    }



    // funcoes de apoio

    function crEl(el, id, text, cl, st) { //element,id,text,class,style
        var node = document.createElement(el)
        if (id != "") {
            node.setAttribute('id', id)
        }
        if (text != "") {
            var text = document.createTextNode(text)
            node.appendChild(text)
        }
        if (cl != "") {
            node.setAttribute('class', cl)
        }
        if (st != "") {
            node.setAttribute('style', st)
        }
        return node
    }

    function gravar(id) {
        //TODO 
        //quando for no campo data, salva o campo com texto
        //mudar de append na lista direto, para salvar no cookies e carregar a lista toda vez que digitar um novo CTe
        //limitar o tamanho da lista

        var val1, val2, val3

        if (id == 2) {
            val1 = document.getElementById("t_ser_ctrc").value
            val2 = document.getElementById("t_nro_ctrc").value
            val3 = 'CTe: '
        } else if (id == 4) {
            val1 = document.getElementById("t_ser_nf").value
            val2 = document.getElementById("t_nro_nf").value
            val3 = 'NF: '
        } else if (id == 6) {
            val1 = document.getElementById("t_nrs").value
            val2 = ""
            val3 = 'NR: '
        } else if (id == 8) {
            val1 = document.getElementById("t_cod_cli").value
            val2 = ""
            val3 = 'Cod. Cliente: '
        } else if (id == 10) {
            val1 = document.getElementById("t_nro_cte").value
            val2 = ""
            val3 = 'CTe Fiscal: '
        } else if (id == 12) {
            val1 = document.getElementById("t_ctrc_orig").value
            val2 = ""
            val3 = 'CTe Orig.'
        } else if (id == 14) {
            val1 = document.getElementById("t_nro_pedido").value
            val2 = ""
            val3 = 'Pedido: '
        } else if (id == 16) {
            val1 = document.getElementById("t_vlr_frete").value
            val2 = ""
            val3 = 'Valor Frete: '
        } else if (id == 18) {
            val1 = document.getElementById("t_protocolo").value
            val2 = ""
            val3 = 'Protocolo: '
        } else if (id == 20) {
            inputs = document.getElementsByTagName("input")
            if (inputs[1].value != "") {
                val1 = inputs[0].value
                val2 = inputs[1].value
                val3 = "CTe: "
            } else if (inputs[3].value != "") {
                val1 = inputs[2].value
                val2 = inputs[3].value
                val3 = "NF: "
            }
        } else if (id == 22) {
            val1 = document.getElementById("t_cod_barras").value
            val2 = ""
            val3 = 'Chave NFe: '
        } else if (id == 23) { //ADICIONADO 09/06
            val1 = document.getElementById("cnpj_cliente").value
            val2 = ""
            val3 = "CNPJ: "
        } else if (id == 24) {
            val1 = document.getElementById("numero_cnpj_grupo").value
            val2 = ""
            val3 = "CNPJ Grupo: "
        } else if (id == 25) {
            val1 = document.getElementById("numero_cnpj_raiz").value
            val2 = ""
            val3 = "CNPJ Raíz: "
        } else if (id == 26) {
            val1 = (document.getElementById('fld_data_lim').value) + " Hora limite: " + (document.getElementById('fld_hora_lim').value)
            val2 = (" N. da Coleta: " + document.getElementById('nro_coleta').value) + " Quantidade de Volumes: " + (document.getElementById('fld_qtde_vol').value)
            val3 = "Data limite: "
        }

        return val3 + val1 + val2
    }

    function enviaAjax(url, params, callback) {
        var xhttp = new XMLHttpRequest();
        /*
        var url = 'https://sistema.ssw.inf.br/bin/ssw0017';
        var params = 'sequencia=1&dummy=1587673338426'
        */
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                var response = xhttp.responseText;
                callback(response);
            }
        };
        xhttp.open("POST", "https://sistema.ssw.inf.br/bin/" + url, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send(params);
    }

    function criaTabelaAcesso() {
        var myObj, html, node, janela;
        var g = [];
        var f = [];

        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                myObj = this.responseText;
                controle = myObj.split(';');

                html = '';
                html = '<table border="1">';

                for (var i = 0; i < controle.length - 1; i++) {
                    grupo = controle[i].split(',');
                    html = html + '<tr><th class="g">' + (grupo[0] == '00' ? 'Grupo' : grupo[0]) + '</th>'
                    g.push(grupo[0])

                    for (var j = 1; j < grupo.length - 1; j++) {
                        if (i == 0) {
                            html = html + '<th class="f">' + grupo[j] + '</th>';
                            f.push(grupo[j]);
                        } else {
                            html = html + '<td><input type="checkbox" ' + (grupo[j] ? 'checked' : '') + ' id="f' + i + j + '"  class="' + grupo[0] + '"></td>';
                        }
                    }
                    html = html + '</tr>'
                }
                html = html + '</table>';

                html = html + '<div id="ctrl"><a href="#" id="envia">Salva</a></div>'

                html = html + ' - <div><input type="number" id="grupoNovo" name="grupoNovo" placeholder="insira o numero do grupo"><a href="#" id="enviaGrupo">Adicionar Grupo</a></div>';

                janela = window.open("/blank.html", "_blank", "fullscreen=0,menubar=0,location=0,toolbar=0," +
                    "status=1,scrollbars=1,resizable=1,width=" + (screen.availWidth - 10) +
                    ",height=" + (screen.availHeight - 10) + ",top=0,left=0");
                janela.resizeTo(screen.availWidth / 2, screen.availHeight);

                janela.window.onload = function() {
                    setTimeout(function() {
                        janela.document.open("text/html", "replace");
                        janela.document.write(html);
                        janela.document.close();
                        janela.document.getElementById('envia').addEventListener("click", function() {
                            console.log('Salva novos acesso');
                            //salva_acesso();
                            var html, fff;
                            var g = [];
                            var f = [];

                            for (var i = 0; i < janela.document.getElementsByClassName('g').length; i++) {
                                g.push(janela.document.getElementsByClassName('g')[i].innerText);
                            }
                            for (var i = 0; i < janela.document.getElementsByClassName('f').length; i++) {
                                f.push(janela.document.getElementsByClassName('f')[i].innerText);
                            }
                            console.log('g:' + g)
                            console.log('f:' + f)
                            fff = "";
                            for (var i = 1; i < g.length - 1; i++) {
                                html = g[i] + ',';
                                for (var j = 0; j < f.length; j++) {
                                    html = html + (janela.document.getElementsByClassName(g[i])[j].checked ? f[j] : '')
                                    html = html + ','

                                }
                                console.log(html)
                                fff = fff + html + ';'
                            }
                            console.log(fff);

                            xmlhttp = new XMLHttpRequest();
                            xmlhttp.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200) {
                                    janela.alert(this.responseText)
                                }
                            }
                            xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=acesso&f1=write&f2=" + fff, true);
                            xmlhttp.send();

                        });

                        janela.document.getElementById('enviaGrupo').addEventListener("click", function() {
                            var gn = janela.document.getElementById("grupoNovo").value
                            xmlhttp = new XMLHttpRequest();
                            xmlhttp.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200) {
                                    janela.alert(this.responseText)
                                }
                            }
                            xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=acesso&f1=grupo&f2=" + gn, true);
                            xmlhttp.send();
                        });

                    }, 100)
                }
            }
        }

        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/?op=acesso&f1=atualiza", true);
        xmlhttp.send();

    }

    function mostrador_mdkg() {
        var texto = '';
        //media kg e % de NF
        if (document.getElementById("mdkg")) {
            console.log('dentro do if');
            valor = parseFloat(document.getElementById('133').value.replace('.', '').replace(',', '.')) / parseFloat(document.getElementById('47').value.replace('.', '').replace(',', '.'))
            valor = isFinite(valor) ? valor : 0.00;
            valor = isNaN(valor) ? 0.00 : valor;
            valor = valor.toFixed(2).replace('.', ',')
            texto = valor.toString();
            console.log(texto);
            valor = parseFloat(document.getElementById('133').value.replace('.', '').replace(',', '.')) / parseFloat(document.getElementById('pesocalculo').value.replace('.', '').replace(',', '.'))
            valor = isFinite(valor) ? valor : 0.00;
            valor = isNaN(valor) ? 0.00 : valor;
            valor = valor.toFixed(2).replace('.', ',')
            console.log(texto);
            texto = texto + (texto == valor.toString() ? '' : (' | ' + valor.toString()));
            //texto = texto + ' | ' + valor.toString(); 
            document.getElementById("mdkg_valor").setAttribute("value", texto);

            valor = parseFloat(document.getElementById('133').value.replace('.', '').replace(',', '.')) / parseFloat(document.getElementById('44').value.replace('.', '').replace(',', '.')) * 100
            valor = isFinite(valor) ? valor : 0.00;
            valor = isNaN(valor) ? 0.00 : valor;
            document.getElementById("perc_valor").setAttribute("value", valor.toFixed(2).replace('.', ','));
        } else {
            node = document.createElement('div');
            node.setAttribute("style", "left:352px;top:512px;width:88px;background-color: wheat");
            node.setAttribute("class", "texto");
            node.setAttribute("id", "mdkg");
            texto = document.createTextNode("R$ / kg (R$): ");
            node.appendChild(texto);
            document.getElementById("frm").appendChild(node);

            node = document.createElement('div');
            node.setAttribute("style", "left:352px;top:528px;width:88px;background-color: wheat");
            node.setAttribute("class", "texto");
            node.setAttribute("id", "perc");
            texto = document.createTextNode("% sob NF (%): ");
            node.appendChild(texto);
            document.getElementById("frm").appendChild(node);

            node = document.createElement('input');
            node.setAttribute("style", "left:440px;top:512px;width:84px; text-align: right;");
            node.setAttribute("class", "nodatal");
            node.setAttribute("type", "text");
            node.setAttribute("id", "mdkg_valor");
            document.getElementById("frm").appendChild(node);

            node = document.createElement('input');
            node.setAttribute("style", "left:440px;top:528px;width:64px; text-align: right;");
            node.setAttribute("class", "nodatal");
            node.setAttribute("type", "text");
            node.setAttribute("id", "perc_valor");
            document.getElementById("frm").appendChild(node);


            valor = parseFloat(document.getElementById('133').value.replace('.', '').replace(',', '.')) / parseFloat(document.getElementById('47').value.replace('.', '').replace(',', '.'))
            valor = isFinite(valor) ? valor : 0.00;
            valor = isNaN(valor) ? 0.00 : valor;
            valor = valor.toFixed(2).replace('.', ',')
            texto = valor.toString();

            valor = parseFloat(document.getElementById('133').value.replace('.', '').replace(',', '.')) / parseFloat(document.getElementById('pesocalculo').value.replace('.', '').replace(',', '.'))
            valor = isFinite(valor) ? valor : 0.00;
            valor = isNaN(valor) ? 0.00 : valor;
            valor = valor.toFixed(2).replace('.', ',')

            texto = texto + (texto == valor.toString() ? '     ' : (' | ' + valor.toString()));
            //texto = texto + ' | ' + valor.toString(); 
            document.getElementById("mdkg_valor").setAttribute("value", texto);

            valor = parseFloat(document.getElementById('133').value.replace('.', '').replace(',', '.')) / parseFloat(document.getElementById('44').value.replace('.', '').replace(',', '.')) * 100
            valor = isFinite(valor) ? valor : 0.00;
            valor = isNaN(valor) ? 0.00 : valor;
            document.getElementById("perc_valor").setAttribute("value", valor.toFixed(2).replace('.', ','));
        }


    }

    function checa_coleta() {
        //Consolida coletas parcerias para facilitar se tem nova ou nao
        // 11 redespacho + 12 rdt
        var arr_unid = ['gru', 'rio', 'bhz', 'rte', 'cvl', 'fln', 'poa', 'gyn', 'tct', 'ene', 'rad', 'AMA', 'ARQ', 'CAO', 'GMI', 'JIP', 'JRU', 'OPO', 'PBO', 'PVH', 'RBO', 'RMO', 'SMG']; //mgr udi
        var arr = [];
        for (var i = 0; i < arr_unid.length; i++) {
            document.getElementById("2").value = arr_unid[i];
            document.getElementById("3").value = "001"
            var xhttp1 = new XMLHttpRequest();
            var url1 = 'https://sistema.ssw.inf.br/bin/menu01';
            var params1 = 'act=TRO&f2=' + arr_unid[i] + '&f3=001&dummy=1587673338426'

            //a primeira vez chama a funcao para mudar a unidade
            xhttp1.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {

                    //a segunda vez ja dentro do menu da coleta, pega o ultimo numero de coleta
                    var xhttp2 = new XMLHttpRequest();
                    var url2 = 'https://sistema.ssw.inf.br/bin/ssw0017';
                    var params2 = 'sequencia=1&dummy=1587673338426'
                    xhttp2.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            // Typical action to be performed when the document is ready:
                            var response = xhttp2.responseText;
                            response = response.substr(response.indexOf('id="4"'), response.substring(response.indexOf('id="4"')).indexOf('</A>')).substring(response.substr(response.indexOf('id="4"'), response.substring(response.indexOf('id="4"')).indexOf('</A>')).indexOf('>') + 1);
                            console.log(arr_unid[i] + ' | ' + response);
                            //console.log( "Unid["+i+"]: " + arr_unid[i] + ' ultima coleta: ' + response);
                            arr.push({
                                unidade: arr_unid[i],
                                coleta: response
                            });
                        }
                    };
                    xhttp2.open("POST", url2, false);
                    xhttp2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    xhttp2.send(params2);
                }
            };
            xhttp1.open("POST", url1, false);
            xhttp1.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhttp1.send(params1);
        }

        /*
        for(var j=0;j<arr.length;j++){
            console.log( "Unid["+j+"]: " + arr[j].unidade + ' ultima coleta: ' + arr[j].coleta);
        }*/

        obj = {
            f1: arr[0].coleta,
            f2: arr[1].coleta,
            f3: arr[2].coleta,
            f4: arr[3].coleta,
            f5: arr[4].coleta,
            f6: arr[5].coleta,
            f7: arr[6].coleta,
            f8: arr[7].coleta,
            f9: arr[8].coleta,
            f10: arr[9].coleta,
            f11: arr[10].coleta,
            f12: arr[11].coleta,
            f13: arr[12].coleta,
            f14: arr[13].coleta,
            f15: arr[14].coleta,
            f16: arr[15].coleta,
            f17: arr[16].coleta,
            f18: arr[17].coleta,
            f19: arr[18].coleta,
            f20: arr[19].coleta,
            f21: arr[20].coleta,
            f22: arr[21].coleta,
            f23: arr[22].coleta
        };
        salva_bd(obj, 'op001', function(x) {
            //aqui colo para atualizar se tem ou nao novas coletas e quais unidades
            var texto = "";
            x = x.split(';');
            //console.log(x.length-1);
            if (x.length == 1) {
                texto = "Nenhuma nova coleta";
            } else {
                texto = "Verificar: ";
                for (var k = 0; k < x.length - 1; k++) {
                    texto = texto + " " + x[k].toUpperCase();
                }
            }
            document.getElementById("div_texto").innerHTML = texto;
            //console.log(x);
            //alert(x[x.length-1]);
        });
    }

    function manifesto() {
        //TODO: qundo a expedicao dar saida, já salva o horario em um BD
    }

    function salva_bd(obj, op, callback) {
        var dbParam, xmlhttp, myObj, x, txt = "";
        //obj = { cotacao: "", desconto: "" };
        //dbParam = JSON.stringify(obj);
        xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                myObj = this.responseText;
                if (callback) {
                    console.log('Retorno com callback: ' + myObj)
                    callback(myObj); //para retorno da response 
                } else {
                    console.log('Retorno com Alert: ' + myObj);
                    alert(myObj);
                }


            }
        };

        xmlhttp.open("GET", "https://sswresponse.azurewebsites.net/" + "?op=" + op + "&" + param(obj), true); //op, obj
        xmlhttp.send();

    }

    function param(object) {
        var parameters = [];
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                parameters.push(encodeURI(property + '=' + object[property]));
            }
        }

        return parameters.join('&');
    }

    function createNewDocCVL(pathname, html) {
        var tagname = "_blank";

        janela = window.open((pathname) ? "/blank.html" : "", tagname, "fullscreen=0,menubar=0,location=0,toolbar=0," +
            "status=1,scrollbars=1,resizable=1,width=" + (screen.availWidth - 10) +
            ",height=" + (screen.availHeight - 10) + ",top=0,left=0");
        janela.resizeTo(screen.availWidth, screen.availHeight);

        janela.window.onload = function() {
            setTimeout(function() {
                janela.document.open("text/html", "replace");
                janela.document.write(html.toString());
                janela.document.close();
                if (pathname) janela.history.pushState({}, "", pathname);
            }, 50)
        }

        /* esta funciona
        var janela2 = window.open("","_blank","fullscreen=0,menubar=0,location=0,toolbar=0," +
            "status=1,scrollbars=1,resizable=1,width=" + 1000 +
            ",height=" + (500) + ",top=0,left=0");
    janela2.resizeTo(screen.availWidth,screen.availHeight);

        setTimeout(function() {
        janela2.document.open("text/html", "replace");
        janela2.document.write ("<p>Hello World!</p>");
        
        //if (pathname) janela.history.pushState({}, "", pathname);
        }, 500)
        */


    }

    function callcenter(ddd, telefone) {
        try {
            var x = document.getElementById("nextIP");
            
            //busca no SSW o cliente
            //desabilitar em cas e bug

            consultarClienteTelefone(telefone,(resposta)=>{
                if(resposta.substring(9,24)=="numero_telefone"){
                    //telefone nao encontrado
                    cnpj=""
                    nome_cliente=""
                    x.className = "show";
                    x.innerText = "Cliente Ligando  - Telefone: (" + ddd + ')' + telefone

                    //mostra na tela o cliente
                    setTimeout(function() {
                        x.className = x.className.replace("show", "");
                    }, 5000);
                }else{
                    //telefone encontrado
                    inicio_xml=resposta.indexOf('<xml id="xmlsr"><rs>')+16
                    fim_xml=resposta.indexOf('</rs></xml>')+5
                    xml = resposta.substring(inicio_xml,fim_xml)
                    //console.log("xml: "+xml)
                    processaXMLssw(xml, (doc)=>{
                        //primeiro [] sao todos os retornos
                        //segundo [] 0 -> CNPJ, 1-> Nome, 2-> Endereco, 3-> Cidade, 4->UF, 5-> CFOP, 6-> Telefone, 7-> Sequencial
                        //terceiro [] sempre 0
                        //console.log(doc)
                        cnpj = doc.getElementsByTagName('r')[0].childNodes[0].childNodes[0].textContent
                        nome_cliente = doc.getElementsByTagName('r')[0].childNodes[1].childNodes[0].textContent
                        x.className = "show";
                        x.innerText = "Cliente Ligando  - Telefone: (" + ddd + ')' + telefone +"\nCNPJ: "+cnpj+ "\nCliente:"+nome_cliente

                        //mostra na tela o cliente
                        setTimeout(function() {
                            x.className = x.className.replace("show", "");
                        }, 10000);
                    })                
                }
            })
            

            
        } catch (err) {
            console.log(err);
        }

    }

    function processaXMLssw(stringXML,callback){
        stringXML="<?xml version='1.0' encoding='UTF-8'?>"+stringXML
        parser = new DOMParser();
        xmlDoc = parser.parseFromString(stringXML,"text/xml");
        if(callback){
            callback(xmlDoc)
        }else{
            return xmlDoc
        }
        
    }

    /*function callcenter(ddd, telefone) {
        try {
            var x = document.getElementById("nextIP");
            x.className = "show";
            x.innerText = "Cliente Ligando  - Telefone: (" + ddd + ')' + telefone
            setTimeout(function() {
                x.className = x.className.replace("show", "");
            }, 5000);
        } catch (err) {
            console.log(err);
        }

    }*/

    function criaDiv() {
        node = document.createElement('div');
        node.setAttribute("id", "nextIP");
        document.body.append(node);
    }

    /*
    function consultarClienteTelefone(telefone, callback) {
        var xhttp = new XMLHttpRequest();
        /*
        var url = 'https://sistema.ssw.inf.br/bin/ssw0017';
        var params = 'sequencia=1&dummy=1587673338426'
        
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                var response = xhttp.responseText;
                //console.log(response)
                callback(response);
            }
        };
        xhttp.open("POST", "https://sistema.ssw.inf.br/bin/ssw0054", true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send("act=TEL&f9=" + telefone + "&tipo=cliente&automatico=S&programa=ssw0054&fld=1&seq_cliente=0&cliente=&dummy=1595442766329");
    }*/


    function consultarClienteTelefone(telefone, callback) {
        var xhttp = new XMLHttpRequest();
        /*
        var url = 'https://sistema.ssw.inf.br/bin/ssw0017';
        var params = 'sequencia=1&dummy=1587673338426'
        */
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                var response = xhttp.responseText;
                //console.log(response)
                if(callback){
                    callback(response);
                }else{
                    return response
                }
            
            }
        };
        xhttp.open("POST", "https://sistema.ssw.inf.br/bin/ssw0054", true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.send("act=TEL&numero_telefone=" + telefone + "&tipo=cliente&automatico=S&programa=ssw0054&fld=1&seq_cliente=0&cliente=&dummy=1595442766329");
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }


    function verifica_coleta() {

        //essa funcao retorna as coletas cadastradas no dia //planilha do bruno de controle de coleta
        var xhttp2 = new XMLHttpRequest();
        var url2 = 'https://sistema.ssw.inf.br/bin/ssw0017?ajax=S&col=D&valor=260221&dummy=1614349796180';

        xhttp2.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Typical action to be performed when the document is ready:
                var response = xhttp2.responseText;
                console.log(response)
            }
        };
        xhttp2.open("GET", url2, false);
        xhttp2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp2.send();
    }


    function showmsg2(msg) {

        document.getElementById("errorpanel").style.width = '100%';
        document.getElementById("errorpanel").style.height = '100%';
        document.getElementById("errormsg").style.height = '102px';
        document.getElementById("errormsg").style.width = '400px';
        document.getElementById("errormsg").style.left = '300px';
        document.getElementById("errormsg").className = "";
        templeft = 300;
        temptop = 208;
        document.getElementById("errormsg").style.top = '208px';
        document.getElementById("errormsg").innerHTML =
            '<div id="scontentbar" style="text-align:right;">' +
            '<label style="left:16px;top:6px;color:white;" class=texto>' +
            'SSW Web</label>' +
            '<a href=# onclick="ccx();showmsgonclick();return false;"' +
            ' style="position:relative;font-size:18px;color:white;text-decoration:none;" class=texto>&nbsp;<b>&#215;</b>&nbsp;</a>' +
            '</div>' +
            '<div class=texto id=errormsglabel style="color:red;left:16px;top:32px;text-align:left;overflow:visible"><b>' +
            msg + '</b></div>';

        var elmh = ElmHeight('errormsglabel');
        var elmw = ElmWidth('errormsglabel');

        //tem coisa pra mostra? mostra a msg agora
        document.getElementById("errormsg").style.visibility = 'visible';
        document.getElementById("errorpanel").style.visibility = 'visible';
        auxscripts = document.getElementsByTagName("btn");
        var myleft = 16;

        var mytop = 64 + (elmh - 12);

        document.getElementById("errormsg").innerHTML +=
            '<a id="0" onfocus="obj=this;" accesskey=& ak=7 class=dialog onclick="showmsgonclick();return false;' +
            '" style="top:' + mytop + 'px;left:16px;" href=#>7. Continuar</a>';
        setTimeout('try{document.getElementById(0).focus()}catch(error){}', 50);

    }

    function ElmHeight(elmID) {
        if (document.getElementById(elmID).clientHeight) {
            return (document.getElementById(elmID).clientHeight);
        } else {
            if (document.getElementById(elmID).offsetHeight) {
                return (document.getElementById(elmID).offsetHeight);
            }
        }
    }

    function ElmWidth(elmID) {
        if (document.getElementById(elmID).clientWidth) {
            return (document.getElementById(elmID).clientWidth);
        } else {
            if (document.getElementById(elmID).offsetWidth) {
                return (document.getElementById(elmID).offsetWidth);
            }
        }
    }

    /*


    searchUrbanDict = function(word){
        var query = word.selectionText;
        chrome.tabs.create({url: "http://www.urbandictionary.com/define.php?term=" + query});
    };

    chrome.contextMenus.create({
    title: "Search in UrbanDictionary",
    contexts:["selection"],  // ContextType
    onclick: searchUrbanDict // A callback function
    });
    */
    /*if (window.location.href != "https://consultapublica.antt.gov.br/Site/ConsultaRNTRC.aspx") {
        telafatura = 0; //setInterval() foi o único jeito de acionar a função da tela ssw0183.05 em 100% dos casos,
        //como a opção 104 transiciona com um AJAX, ela não ativa o switch inicial que um carregamento normal de tela ativaria
        setInterval(function() {
            if (telafatura == 0) {
                var testaLoop = document.getElementById("telaprog").textContent.substring(0, 10).trim();
                if (testaLoop == "ssw0183.05") {
                    op457();
                    telafatura = 1;
                } else if (testaLoop == "ssw0173.28") {
                    marca_dagua();
                    telafatura = 1;
                }
            }
        }, 4000)
    }*/
    
    function erenilda(){
        
        telafatura = 0; //setInterval() foi o único jeito de acionar a função da tela ssw0183.05 em 100% dos casos,
        //como a opção 104 transiciona com um AJAX, ela não ativa o switch inicial que um carregamento normal de tela ativaria
        setInterval(function() {
                var testaLoop = document.getElementById("telaprog").textContent.substring(0, 10).trim();
                if(telafatura==0){
                if (testaLoop == "ssw0183.05") {
                    op457();
                    telafatura = 1;
                } else if (testaLoop == "ssw0173.28") {
                    marca_dagua();
                }
                }
              
        }, 6000);
    }


    erenilda();
    /*
    telafatura = 0; //setInterval() foi o único jeito de acionar a função da tela ssw0183.05 em 100% dos casos,
        //como a opção 104 transiciona com um AJAX, ela não ativa o switch inicial que um carregamento normal de tela ativaria
        setInterval(function() {
            if (telafatura == 0) {
                var testaLoop = document.getElementById("telaprog").textContent.substring(0, 10).trim();
                if (testaLoop == "ssw0183.05") {
                    op457();
                    telafatura = 1;
                } else if (testaLoop == "ssw0173.28") {
                    marca_dagua();
                    telafatura = 1;
                }
            }
        }, 4000)*/