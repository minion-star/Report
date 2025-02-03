from google.oauth2 import service_account
import pandas as pd
import matplotlib.pyplot as plt
import sys
import xlwings as xw
from google.cloud import bigquery
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
cache = {}
key_path = ".\\lyrical-country-397623-26653c08607b.json"
credentials = service_account.Credentials.from_service_account_file(
    key_path,
    scopes=["https://www.googleapis.com/auth/cloud-platform"],
)

project_id = "lyrical-country-397623"
save_dataset_id = "Query_Save"
client = bigquery.Client(credentials=credentials, project=credentials.project_id)

def get_all_schemas():
    try:
        dataset_list = list(client.list_datasets())
        dataset_names = [dataset.dataset_id for dataset in dataset_list]
        return dataset_names
    except Exception as e:
        return None

def get_all_tables(schema_name):
    try:
        dataset_list = list(client.list_datasets())
        table_list = ""
        for dataset in dataset_list:
            if dataset.dataset_id == schema_name:
                tables = list(client.list_tables(dataset.dataset_id))
                table_list = [table.table_id for table in tables]
        return table_list
    except Exception as e:
        return None


def get_only_prestage_tables():
    dataset_list = list(client.list_datasets())
    table_list = ""
    for dataset in dataset_list:
        if dataset.dataset_id == "Prestage":
            tables = list(client.list_tables(dataset.dataset_id))
            for table in tables:
                table_list = table_list + "#" + f"{dataset.dataset_id}.{table.table_id}"
    return table_list


def get_all_columns(schema, table):
    try:
        dataset_id = schema
        table_id = table
        dataset_ref = client.get_dataset(dataset_id)
        table_ref = dataset_ref.table(table_id)
        table = client.get_table(table_ref)
        schema = table.schema
        result = [column.name for column in schema]
        return result
    except Exception as e:
        return None

# schema names api
@app.route("/api/get_all_schemas", methods=['GET'])
def get_schemas():
    if not client:
        return jsonify({"error": "BigQuery client not initialized."}), 500
    schemas = get_all_schemas()
    if schemas is None:
        return jsonify({"error": "Failed to fetch schemas."}), 500
    return jsonify(schemas)
# table names api
@app.route("/api/get_all_schemas/<schema>", methods=["GET"])
def get_tables(schema):
    if not client:
        return jsonify({"error": "BigQuery client not initialized."}), 500
    tables = get_all_tables(schema)
    if tables is None:
        return jsonify({"error":"Failed to fetch tables"}), 500
    return tables
# column names api
@app.route("/api/get_all_columns/<schema>/<table>", methods=["GET"])
def get_columns(schema, table):
    if not client:
        return jsonify({"error": "BigQuery client not initialized."}), 500
    columns = get_all_columns(schema, table)
    if columns is None:
        return jsonify({"error":"Failed to fetch columns"}), 500
    return columns
# fetching table data api
@app.route("/api/get_selected_columns/<schema>/<table>", methods=["POST"])
def get_selected_columns(schema, table):
    if not client:
        return jsonify({"error": "BigQuery client not initialized."}), 500

    selected_columns = request.json.get('columns')
    if not selected_columns:
        return jsonify({"error": "No columns selected."}), 400

    # Ensure column names are properly formatted to prevent SQL injection
    columns_str = ", ".join([f"`{col}`" for col in selected_columns])

    sql = f"SELECT {columns_str} FROM `{credentials.project_id}.{schema}.{table}`"
    
    try:
        df = client.query(sql).to_dataframe()
        return jsonify(df.to_dict(orient='records'))
    except Exception as e:
        return jsonify({"error": f"Failed to fetch data: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


