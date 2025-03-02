import plotly.graph_objs as go
from plotly.offline import plot
import requests
from django.shortcuts import render
from .forms import StockSearchForm

# Remplace par ta clé API
API_KEY = "87DDXWZ2HRLLRNMG"

def stock_view(request):
    stock_data = None
    chart = None
    form = StockSearchForm(request.GET or None)
    error_message = None

    if form.is_valid():
        symbol = form.cleaned_data['symbol']
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=5min&apikey={API_KEY}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            time_series = data.get("Time Series (5min)", {})

            if time_series:
                stock_data = [
                    {
                        'time': time,
                        'open': float(values['1. open']),
                        'high': float(values['2. high']),
                        'low': float(values['3. low']),
                        'close': float(values['4. close']),
                        'volume': values['5. volume'],
                    }
                    for time, values in time_series.items()
                ]

                # Extraire les données pour le graphique
                times = [d['time'] for d in stock_data]
                opens = [d['open'] for d in stock_data]
                highs = [d['high'] for d in stock_data]
                lows = [d['low'] for d in stock_data]
                closes = [d['close'] for d in stock_data]

                # Créer le graphique avec Plotly
                fig = go.Figure(data=[go.Candlestick(x=times,
                    open=opens, high=highs, low=lows, close=closes)])

                fig.update_layout(
                    title=f'Graphique des actions pour {symbol}',
                    xaxis_title='Heure',
                    yaxis_title='Prix',
                    xaxis_rangeslider_visible=False
                )

                chart = plot(fig, output_type='div')
            else:
                error_message = "Aucun résultat trouvé pour cette recherche."
        else:
            error_message = "Erreur lors de la récupération des données."

    return render(request, 'stocks/stock.html', {'form': form, 'chart': chart, 'stock_data': stock_data, 'error_message': error_message})
